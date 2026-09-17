'use client';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { supplyApi } from '@/lib/api/resources';
import type { IngredientResponse } from '@/types/domain';
type Pending = {
  supplyChangeId: number;
  ingredientId: string;
  candidateId: number;
  changeType: string;
};
export function SupplyFollowup({
  projectId,
  ingredients,
}: {
  projectId: number;
  ingredients: IngredientResponse[];
}) {
  const [items, setItems] = useState<Pending[]>([]);
  const [selected, setSelected] = useState<Pending | null>(null);
  useEffect(() => {
    let alive = true;
    apiRequest<Pending[]>(`/projects/${projectId}/pending-supply-reviews`)
      .then((items) => {
        if (alive) setItems(items);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [projectId]);
  if (!items.length) return null;
  return (
    <>
      <section className="data-banner">
        <div>
          <b>원료 공급 변경 후속 조치</b>
          <p>검토가 필요한 후보가 {items.length}개 있습니다.</p>
        </div>
        <button className="data-outline" onClick={() => setSelected(items[0])}>
          후속 조치 검토
        </button>
      </section>
      {selected && (
        <SupplyDialog
          item={selected}
          name={
            ingredients.find(
              (item) => item.ingredientId === selected.ingredientId,
            )?.name ?? selected.ingredientId
          }
          onClose={() => setSelected(null)}
          onDone={() => {
            setItems(items.filter((item) => item !== selected));
            setSelected(null);
          }}
        />
      )}
    </>
  );
}
function SupplyDialog({
  item,
  name,
  onClose,
  onDone,
}: {
  item: Pending;
  name: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [decision, setDecision] = useState<
    'REVISE_FORMULA' | 'KEEP_FORMULA' | 'DISCARD_CANDIDATE'
  >('REVISE_FORMULA');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.showModal();
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  async function submit() {
    if (!reason.trim() || busy) return;
    setBusy(true);
    try {
      await supplyApi.decide(item.candidateId, {
        supplyChangeId: item.supplyChangeId,
        decision,
        rationale: reason.trim(),
      });
      onDone();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : '저장하지 못했습니다.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="data-dialog"
      aria-labelledby="supply-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <button
        className="data-dialog-close"
        aria-label="닫기"
        disabled={busy}
        onClick={onClose}
      >
        <X />
      </button>
      <h2 id="supply-title">원료 공급 변경 후속 조치</h2>
      <p>공급 변경으로 영향을 받는 후보에 대한 후속 조치를 선택해 주세요.</p>
      <h3>변경 대상</h3>
      <dl className="data-change-summary">
        <div>
          <dt>원료</dt>
          <dd>{name}</dd>
        </div>
        <div>
          <dt>변경 유형</dt>
          <dd>
            {(
              {
                LEAD_TIME_INCREASE: '리드타임 증가',
                PRICE_INCREASE: '가격 인상',
                PRICE_DECREASE: '가격 인하',
                DISCONTINUED: '공급 중단',
                SUPPLY_RESTORED: '공급 재개',
                OTHER: '기타',
              } as Record<string, string>
            )[item.changeType] ?? item.changeType}
          </dd>
        </div>
        <div>
          <dt>영향 후보</dt>
          <dd>FORMULA {String(item.candidateId).padStart(2, '0')}</dd>
        </div>
      </dl>
      <fieldset disabled={busy}>
        <legend>후속 조치 선택</legend>
        {(
          [
            [
              'REVISE_FORMULA',
              '조향식 수정',
              '변경된 공급 조건에 맞춰 수정이 필요함을 기록합니다.',
            ],
            ['KEEP_FORMULA', '유지', '현재 조향식을 유지합니다.'],
            [
              'DISCARD_CANDIDATE',
              '후보 폐기',
              '해당 후보의 폐기 결정을 기록합니다.',
            ],
          ] as const
        ).map(([value, label, description]) => (
          <label key={value}>
            <input
              type="radio"
              name="supply-decision"
              checked={decision === value}
              onChange={() => setDecision(value)}
            />
            <span>
              {label}
              <small>{description}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <label className="data-reason" htmlFor="supply-reason">
        사유 입력 <span>(필수)</span>
      </label>
      <div className="data-textarea-count">
        <textarea
          id="supply-reason"
          maxLength={300}
          disabled={busy}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="후속 조치 사유를 입력해 주세요."
        />
        <span>{reason.length}/300</span>
      </div>
      {notice && <p role="alert">{notice}</p>}
      <footer>
        <button className="data-outline" disabled={busy} onClick={onClose}>
          취소
        </button>
        <button
          className="data-primary"
          disabled={busy || !reason.trim()}
          onClick={() => void submit()}
        >
          {busy ? '저장 중…' : '확인'}
        </button>
      </footer>
    </dialog>
  );
}
