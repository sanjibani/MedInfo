const STORAGE_KEY = 'medi_info_cabinet_v1';

export const saveMedicine = (medicine) => {
    try {
        const existing = getSavedMedicines();
        // Check for duplicates (by name)
        if (existing.some(m => m.name.toLowerCase() === medicine.name.toLowerCase())) {
            return false;
        }

        const newMedicine = {
            id: Date.now().toString(),
            scannedAt: new Date().toISOString(),
            ...medicine
        };

        const updated = [newMedicine, ...existing];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return true;
    } catch (e) {
        console.error('Failed to save medicine:', e);
        return false;
    }
};

export const getSavedMedicines = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to load medicines:', e);
        return [];
    }
};

export const removeMedicine = (id) => {
    try {
        const existing = getSavedMedicines();
        const updated = existing.filter(m => m.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.error('Failed to remove medicine:', e);
        return [];
    }
};
