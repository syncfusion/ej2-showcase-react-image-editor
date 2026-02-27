import { useRef, useState, useCallback } from 'react';
import { ImageEditorComponent, type ZoomSettingsModel } from '@syncfusion/ej2-react-image-editor';
import { ToolType, type ImageEditorState } from '../types/imageEditor.types';

export const useImageEditor = (zoomSettings?: ZoomSettingsModel) => {
    const editorRef = useRef<ImageEditorComponent>(null);

    const minZoom = zoomSettings?.minZoomFactor ?? 0.1;   // 10%
    const maxZoom = zoomSettings?.maxZoomFactor ?? 5;     // 500%
    
    // Multiplicative steps → feels consistent at any zoom level
    const zoomInFactor  = 1.25;   // +25%
    const zoomOutFactor = 0.8;    // ≈ -20%  (1 / 1.25)

    const [state, setState] = useState<ImageEditorState>({
        currentTool: ToolType.NONE,
        isImageLoaded: false,
        canUndo: true,
        canRedo: true,
        zoomLevel: 1,
        exportFormat: 'PNG',
    });

    const updateUndoRedoState = useCallback(() => {
        if (editorRef.current) {
            setState(prev => ({
                ...prev,
                canUndo: editorRef.current?.canUndo() || false,
                canRedo: editorRef.current?.canRedo() || false,
            }));
        }
    }, []);

    const setCurrentTool = useCallback((tool: ToolType) => {
        setState(prev => ({ ...prev, currentTool: tool }));
    }, []);

    const setImageLoaded = useCallback((loaded: boolean) => {
        setState(prev => ({ ...prev, isImageLoaded: loaded }));
    }, []);

    const setExportFormat = useCallback((format: string) => {
        setState(prev => ({ ...prev, exportFormat: format }));
    }, []);

    const undo = useCallback(() => {
        editorRef.current?.undo();
        updateUndoRedoState();
    }, [updateUndoRedoState]);

    const redo = useCallback(() => {
        editorRef.current?.redo();
        updateUndoRedoState();
    }, [updateUndoRedoState]);

    const zoomIn = useCallback(() => {
        if (editorRef.current) {
            const next = state.zoomLevel * zoomInFactor;
            const newZoom = Math.min(maxZoom, Number(next.toFixed(4)));
            editorRef.current.zoom(newZoom);
            setState(prev => ({ ...prev, zoomLevel: newZoom }));
        }
    }, [state.zoomLevel, maxZoom]);

    const zoomOut = useCallback(() => {
        if (editorRef.current) {
            const next = state.zoomLevel * zoomOutFactor;
            const newZoom = Math.max(minZoom, Number(next.toFixed(4)));
            editorRef.current.zoom(newZoom);
            setState(prev => ({ ...prev, zoomLevel: newZoom }));
        }
    }, [state.zoomLevel, minZoom]);

    const setZoom = useCallback((zoom: number) => {
        if (!editorRef.current) return;
        const clamped = Math.max(minZoom, Math.min(maxZoom, Number(zoom.toFixed(4))));
        editorRef.current.zoom(clamped);
        setState(prev => ({ ...prev, zoomLevel: clamped }));
    }, [minZoom, maxZoom]);

    const resetEditor = useCallback(() => {
        if (editorRef.current) {
            editorRef.current.reset();
            setState(prev => ({
                ...prev,
                zoomLevel: 1,
                // currentTool: ToolType.NONE,   // uncomment if you want to reset tool too
            }));
            updateUndoRedoState();
        }
    }, [updateUndoRedoState]);

    return {
        editorRef,
        state,
        setCurrentTool,
        setImageLoaded,
        setExportFormat,
        updateUndoRedoState,
        undo,
        redo,
        zoomIn,
        zoomOut,
        setZoom,
        resetEditor,
    };
};