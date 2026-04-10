import { useState, useCallback } from 'react';
import { STORAGE_KEY } from '../../data/msp-data';

const EMPTY_STATE = {
  vendorStatuses: {},   // { [vendorId]: 'not_discussed' | 'confirmed_keep' | ... }
  vendorNotes: {},      // { [vendorId]: string }
  askedQuestions: {},    // { [categoryIdx-itemIdx]: true }
  questionAnswers: {},   // { [categoryIdx-itemIdx]: string }
  vendorQuestions: {},   // { [vendorId-qIdx]: true }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY_STATE, ...JSON.parse(raw) } : { ...EMPTY_STATE };
  } catch {
    return { ...EMPTY_STATE };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — degrade gracefully
  }
}

/**
 * Shared hook for all MSP walkthrough interactive state.
 * Single source of truth, persisted to localStorage.
 */
export default function useMspState() {
  const [state, setState] = useState(loadState);

  const update = useCallback((patch) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveState(next);
      return next;
    });
  }, []);

  const setVendorStatus = useCallback((vendorId, status) => {
    setState((prev) => {
      const next = {
        ...prev,
        vendorStatuses: { ...prev.vendorStatuses, [vendorId]: status },
      };
      saveState(next);
      return next;
    });
  }, []);

  const setVendorNote = useCallback((vendorId, note) => {
    setState((prev) => {
      const next = {
        ...prev,
        vendorNotes: { ...prev.vendorNotes, [vendorId]: note },
      };
      saveState(next);
      return next;
    });
  }, []);

  const toggleAskedQuestion = useCallback((key) => {
    setState((prev) => {
      const next = {
        ...prev,
        askedQuestions: {
          ...prev.askedQuestions,
          [key]: !prev.askedQuestions[key],
        },
      };
      saveState(next);
      return next;
    });
  }, []);

  const setQuestionAnswer = useCallback((key, answer) => {
    setState((prev) => {
      const next = {
        ...prev,
        questionAnswers: { ...prev.questionAnswers, [key]: answer },
      };
      saveState(next);
      return next;
    });
  }, []);

  const toggleVendorQuestion = useCallback((key) => {
    setState((prev) => {
      const next = {
        ...prev,
        vendorQuestions: {
          ...prev.vendorQuestions,
          [key]: !prev.vendorQuestions[key],
        },
      };
      saveState(next);
      return next;
    });
  }, []);

  const exportNotes = useCallback(() => {
    const blob = new Blob(
      [JSON.stringify(state, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `msp-walkthrough-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  return {
    state,
    update,
    setVendorStatus,
    setVendorNote,
    toggleAskedQuestion,
    setQuestionAnswer,
    toggleVendorQuestion,
    exportNotes,
  };
}
