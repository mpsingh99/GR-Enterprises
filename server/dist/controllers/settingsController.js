import { StoreSettingsModel } from '../models/StoreSettings.js';
export const getSettings = async (_req, res) => {
    try {
        let settings = await StoreSettingsModel.findOne();
        if (!settings) {
            settings = await StoreSettingsModel.create({});
        }
        res.json({ success: true, data: settings });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const updateSettings = async (req, res) => {
    try {
        let settings = await StoreSettingsModel.findOne();
        if (!settings) {
            settings = await StoreSettingsModel.create(req.body);
        }
        else {
            Object.assign(settings, req.body);
            await settings.save();
        }
        res.json({ success: true, message: 'Store settings updated', data: settings });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
