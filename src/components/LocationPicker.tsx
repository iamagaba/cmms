import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Modal, Button } from 'antd';
import L from 'leaflet';

// Fix for default icon issue in react-leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


interface LocationPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onLocationSelect: (coords: { lat: number; lng: number }) => void;
}

const LocationMarker = ({ position, setPosition }: any) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

export const LocationPicker = ({ isOpen, onClose, onLocationSelect }: LocationPickerProps) => {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const kampalaCenter: [number, number] = [0.32, 32.58];

    const handleConfirm = () => {
        if (position) {
            onLocationSelect(position);
            onClose();
        }
    };
    
    const handleUseCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition({ lat: latitude, lng: longitude });
            },
            (err) => {
                console.warn(`ERROR(${err.code}): ${err.message}`);
            }
        );
    };

    useEffect(() => {
        if (isOpen) {
            setPosition(null);
        }
    }, [isOpen]);

    return (
        <Modal
            title="Select Client Location"
            open={isOpen}
            onCancel={onClose}
            width={800}
            destroyOnClose
            footer={[
                <Button key="current" onClick={handleUseCurrentLocation}>Use My Current Location</Button>,
                <Button key="back" onClick={onClose}>Cancel</Button>,
                <Button key="submit" type="primary" onClick={handleConfirm} disabled={!position}>Confirm Location</Button>,
            ]}
        >
            <p>Click on the map to place a marker or use your current location.</p>
            <MapContainer center={kampalaCenter} zoom={13} style={{ height: '500px', width: '100%', marginTop: '16px' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
        </Modal>
    );
};