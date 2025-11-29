import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { CameraView as ExpoCameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Device from 'expo-device';
import { Ionicons } from '@expo/vector-icons';
import { useCamera, CameraMode, CameraError } from '../hooks/useCamera';

export interface CameraViewProps {
    mode: CameraMode;
    onCapture: (imageUri: string) => void;
    onError: (error: CameraError) => void;
    onCancel?: () => void;
}

export function CameraViewComponent({
    mode,
    onCapture,
    onError,
    onCancel,
}: CameraViewProps) {
    const {
        hasPermission,
        isPermissionLoading,
        requestPermission,
        isReady,
        facing,
        flashEnabled,
        toggleFlash,
        setIsReady,
        cameraRef,
        capture,
        isCapturing,
        error,
        clearError,
    } = useCamera({ onError });

    const [isPickingImage, setIsPickingImage] = useState(false);

    // Check if running in simulator (no physical camera)
    const isSimulator = !Device.isDevice;

    // Request permission on mount
    useEffect(() => {
        if (hasPermission === null && !isPermissionLoading) {
            requestPermission();
        }
    }, [hasPermission, isPermissionLoading, requestPermission]);

    // Handle picking image from gallery
    const handlePickImage = async () => {
        try {
            setIsPickingImage(true);

            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                onError({
                    code: 'PERMISSION_DENIED',
                    message: 'Permission to access photo library was denied.',
                });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                allowsEditing: false,
            });

            if (!result.canceled && result.assets[0]) {
                onCapture(result.assets[0].uri);
            }
        } catch (err) {
            onError({
                code: 'IMAGE_PICKER_ERROR',
                message: 'Failed to pick image from gallery.',
            });
        } finally {
            setIsPickingImage(false);
        }
    };

    // Handle capture
    const handleCapture = async () => {
        const uri = await capture();
        if (uri) {
            onCapture(uri);
        }
    };

    // Handle camera ready
    const handleCameraReady = () => {
        setIsReady(true);
    };

    // Handle mount error
    const handleMountError = () => {
        onError({
            code: 'CAMERA_INIT_FAILED',
            message: 'Failed to initialize camera. Please try again.',
        });
    };

    // Loading state while checking permissions
    if (isPermissionLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.statusText}>Checking camera permissions...</Text>
                </View>
            </View>
        );
    }

    // Permission denied state
    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <View style={styles.centerContent}>
                    <Ionicons name="camera-outline" size={64} color="#9ca3af" />
                    <Text style={styles.errorTitle}>Camera Access Required</Text>
                    <Text style={styles.errorText}>
                        Please enable camera access in your device settings to scan receipts and labels.
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={requestPermission}>
                        <Text style={styles.retryButtonText}>Request Permission</Text>
                    </TouchableOpacity>
                    {onCancel && (
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.centerContent}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text style={styles.errorTitle}>Camera Error</Text>
                    <Text style={styles.errorText}>{error.message}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={clearError}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                    {onCancel && (
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    // Camera view
    return (
        <View style={styles.container}>
            <ExpoCameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                flash={flashEnabled ? 'on' : 'off'}
                onCameraReady={handleCameraReady}
                onMountError={handleMountError}
            />

            {/* Mode indicator */}
            <View style={styles.modeIndicator}>
                <Text style={styles.modeText}>
                    {mode === 'receipt' ? 'Scan Receipt' : 'Scan Label'}
                </Text>
            </View>

            {/* Scanning guide overlay */}
            <View style={styles.overlay}>
                <View style={styles.scanFrame}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>
                <Text style={styles.guideText}>
                    {mode === 'receipt'
                        ? 'Position the receipt within the frame'
                        : 'Position the expiration date within the frame'}
                </Text>
            </View>

            {/* Simulator notice */}
            {isSimulator && (
                <View style={styles.simulatorNotice}>
                    <Text style={styles.simulatorNoticeText}>
                        Camera not available in simulator. Use gallery instead.
                    </Text>
                </View>
            )}

            {/* Controls */}
            <View style={styles.controls}>
                {/* Cancel button */}
                {onCancel && (
                    <TouchableOpacity style={styles.controlButton} onPress={onCancel}>
                        <Ionicons name="close" size={28} color="#ffffff" />
                    </TouchableOpacity>
                )}

                {/* Gallery button - always visible, prominent in simulator */}
                <TouchableOpacity
                    style={[styles.controlButton, isSimulator && styles.galleryButtonProminent]}
                    onPress={handlePickImage}
                    disabled={isPickingImage}
                >
                    {isPickingImage ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Ionicons name="images" size={28} color="#ffffff" />
                    )}
                </TouchableOpacity>

                {/* Capture button */}
                <TouchableOpacity
                    style={[
                        styles.captureButton,
                        (!isReady || isCapturing || isSimulator) && styles.captureButtonDisabled,
                    ]}
                    onPress={handleCapture}
                    disabled={!isReady || isCapturing || isSimulator}
                >
                    {isCapturing ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <View style={styles.captureButtonInner} />
                    )}
                </TouchableOpacity>

                {/* Flash toggle */}
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleFlash}
                    disabled={isSimulator}
                >
                    <Ionicons
                        name={flashEnabled ? 'flash' : 'flash-off'}
                        size={28}
                        color={isSimulator ? '#6b7280' : '#ffffff'}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    camera: {
        flex: 1,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    statusText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    errorTitle: {
        marginTop: 16,
        fontSize: 20,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
    },
    errorText: {
        marginTop: 8,
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    retryButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    cancelButton: {
        marginTop: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#6b7280',
    },
    modeIndicator: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    modeText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 280,
        height: 200,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderColor: '#ffffff',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 3,
        borderLeftWidth: 3,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 3,
        borderRightWidth: 3,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 3,
        borderRightWidth: 3,
    },
    guideText: {
        marginTop: 24,
        fontSize: 14,
        color: '#ffffff',
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    captureButtonDisabled: {
        opacity: 0.5,
    },
    captureButtonInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#ffffff',
    },
    simulatorNotice: {
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(59, 130, 246, 0.9)',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    simulatorNoticeText: {
        color: '#ffffff',
        fontSize: 14,
        textAlign: 'center',
    },
    galleryButtonProminent: {
        backgroundColor: '#3b82f6',
        width: 60,
        height: 60,
        borderRadius: 30,
    },
});

export default CameraViewComponent;
