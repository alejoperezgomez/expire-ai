import { useState, useCallback, useRef } from 'react';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { ErrorCodes } from '../types';

export type CameraMode = 'receipt' | 'label';

export interface UseCameraOptions {
    onError?: (error: CameraError) => void;
}

export interface CameraError {
    code: string;
    message: string;
}

export interface UseCameraReturn {
    // Permission state
    hasPermission: boolean | null;
    isPermissionLoading: boolean;
    requestPermission: () => Promise<boolean>;

    // Camera state
    isReady: boolean;
    facing: CameraType;
    flashEnabled: boolean;

    // Camera controls
    toggleFlash: () => void;
    toggleFacing: () => void;
    setIsReady: (ready: boolean) => void;

    // Capture
    capturedUri: string | null;
    isCapturing: boolean;
    capture: () => Promise<string | null>;
    clearCapture: () => void;

    // Ref for CameraView
    cameraRef: React.RefObject<CameraView | null>;

    // Error state
    error: CameraError | null;
    clearError: () => void;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
    const { onError } = options;

    // Permission state
    const [permission, requestPermissionAsync] = useCameraPermissions();

    // Camera state
    const [isReady, setIsReady] = useState(false);
    const [facing, setFacing] = useState<CameraType>('back');
    const [flashEnabled, setFlashEnabled] = useState(false);

    // Capture state
    const [capturedUri, setCapturedUri] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    // Error state
    const [error, setError] = useState<CameraError | null>(null);

    // Camera ref
    const cameraRef = useRef<CameraView>(null);

    // Handle errors
    const handleError = useCallback((cameraError: CameraError) => {
        setError(cameraError);
        onError?.(cameraError);
    }, [onError]);

    // Request camera permission
    const requestPermission = useCallback(async (): Promise<boolean> => {
        try {
            const result = await requestPermissionAsync();
            if (!result.granted) {
                handleError({
                    code: ErrorCodes.CAMERA_PERMISSION_DENIED,
                    message: 'Camera permission was denied. Please enable it in settings.',
                });
                return false;
            }
            return true;
        } catch (err) {
            handleError({
                code: ErrorCodes.CAMERA_PERMISSION_DENIED,
                message: 'Failed to request camera permission.',
            });
            return false;
        }
    }, [requestPermissionAsync, handleError]);

    // Toggle flash
    const toggleFlash = useCallback(() => {
        setFlashEnabled(prev => !prev);
    }, []);

    // Toggle camera facing
    const toggleFacing = useCallback(() => {
        setFacing(prev => (prev === 'back' ? 'front' : 'back'));
    }, []);

    // Capture image
    const capture = useCallback(async (): Promise<string | null> => {
        if (!cameraRef.current || !isReady) {
            handleError({
                code: ErrorCodes.IMAGE_PROCESSING_FAILED,
                message: 'Camera is not ready. Please try again.',
            });
            return null;
        }

        setIsCapturing(true);
        setError(null);

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
                skipProcessing: false,
            });

            if (photo?.uri) {
                setCapturedUri(photo.uri);
                return photo.uri;
            }

            handleError({
                code: ErrorCodes.IMAGE_PROCESSING_FAILED,
                message: 'Failed to capture image. Please try again.',
            });
            return null;
        } catch (err) {
            handleError({
                code: ErrorCodes.IMAGE_PROCESSING_FAILED,
                message: 'An error occurred while capturing the image.',
            });
            return null;
        } finally {
            setIsCapturing(false);
        }
    }, [isReady, handleError]);

    // Clear captured image
    const clearCapture = useCallback(() => {
        setCapturedUri(null);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Camera ready handler (to be called by CameraView onCameraReady)
    // This is exposed via the isReady state which should be set by the component

    return {
        // Permission state
        hasPermission: permission?.granted ?? null,
        isPermissionLoading: !permission,
        requestPermission,

        // Camera state
        isReady,
        facing,
        flashEnabled,

        // Camera controls
        toggleFlash,
        toggleFacing,
        setIsReady,

        // Capture
        capturedUri,
        isCapturing,
        capture,
        clearCapture,

        // Ref
        cameraRef,

        // Error state
        error,
        clearError,
    };
}


