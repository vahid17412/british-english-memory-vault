import { useState, useCallback, useEffect, useRef } from 'react';
import { cardEditorService, cardRepo } from '@/config/dependencies';
import { EditorFormSchema, EditorFormValues } from '../utils/EditorValidator';
import { UI_CONSTANTS } from '@/shared/constants/UIConstants';
import { ErrorReporter } from '@/shared/utils/ErrorReporter';
import { DuplicateCardError } from '@/domain/errors/CardErrors';
import { z } from 'zod';

export function useCardEditor(initialCardId?: string, onSuccess?: () => void) {
  const [formData, setFormData] = useState<EditorFormValues>({ target: '', englishMeaning: '', persianMeaning: '', ipa: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof EditorFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!initialCardId);
  
  // Status messages
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!initialCardId) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const loadCard = async () => {
      try {
        const card = await cardRepo.getById(initialCardId);
        if (!controller.signal.aborted && card) {
          setFormData({
            target: card.target,
            englishMeaning: card.englishMeaning,
            persianMeaning: card.persianMeaning || '',
            ipa: card.ipa || ''
          });
        }
      } catch (err) {
        ErrorReporter.report('useCardEditor.loadCard', err);
        if (!controller.signal.aborted) setGeneralError(UI_CONSTANTS.ERRORS.LOAD_FAILED);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadCard();
    return () => controller.abort();
  }, [initialCardId]);

  const handleChange = useCallback((field: keyof EditorFormValues, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setGeneralError(null);
    setSuccessMessage(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});
    setGeneralError(null);
    setSuccessMessage(null);

    try {
      const validData = EditorFormSchema.parse(formData);

      if (initialCardId) {
        await cardEditorService.updateCard(initialCardId, validData);
        setSuccessMessage(UI_CONSTANTS.EDITOR.SUCCESS_EDIT);
      } else {
        await cardEditorService.addCard(validData);
        setSuccessMessage(UI_CONSTANTS.EDITOR.SUCCESS_ADD);
        setFormData({ target: '', englishMeaning: '', persianMeaning: '', ipa: '' });
      }

      if (onSuccess) onSuccess();

    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof EditorFormValues, string>> = {};
        err.errors.forEach(e => { if (e.path[0]) fieldErrors[e.path[0] as keyof EditorFormValues] = e.message; });
        setErrors(fieldErrors);
      } else if (err instanceof DuplicateCardError) {
        setGeneralError(UI_CONSTANTS.EDITOR.ERR_DUPLICATE);
      } else {
        ErrorReporter.report('useCardEditor.handleSubmit', err);
        setGeneralError(UI_CONSTANTS.EDITOR.ERR_SAVE);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, initialCardId, isSubmitting, onSuccess]);

  return {
    formData,
    errors,
    generalError,
    successMessage,
    isLoading,
    isSubmitting,
    handleChange,
    handleSubmit
  };
}
