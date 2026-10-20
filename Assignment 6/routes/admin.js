const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');

const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Slot = require('../models/Slot');
const Appointment = require('../models/Appointment');

// All admin routes require login + admin role
router.use(verifyToken, isAdmin);

// Helper to reload dashboard with a message
async function renderDashboard(res, req, msg, isError = false) {
    const hospitals = await Hospital.find();
    const doctors = await Doctor.find().populate('hospital');
    const slots = await Slot.find().populate('doctor');
    const appointments = await Appointment.find().populate('patient').populate('slot');
    res.render('admin-dashboard', {
        admin: req.user,
        hospitals,
        doctors,
        slots,
        appointments,
        error: isError ? msg : null,
        success: isError ? null : msg
    });
}

// ========================
// ADMIN DASHBOARD
// ========================
router.get('/dashboard', async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        const doctors = await Doctor.find().populate('hospital');
        const slots = await Slot.find().populate('doctor');
        const appointments = await Appointment.find().populate('patient').populate('slot');

        res.render('admin-dashboard', {
            admin: req.user,
            hospitals,
            doctors,
            slots,
            appointments,
            error: null,
            success: req.query.msg || null
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ========================
// HOSPITAL — CREATE
// ========================
router.post('/hospital', async (req, res) => {
    try {
        const { name, address, contact } = req.body;

        // Validate phone: must be exactly 10 digits
        if (contact && !/^\d{10}$/.test(contact)) {
            return renderDashboard(res, req, 'Phone number must be exactly 10 digits', true);
        }

        // Check duplicate hospital name
        const exists = await Hospital.findOne({ name: name.trim() });
        if (exists) {
            return renderDashboard(res, req, 'Hospital "' + name + '" already exists', true);
        }

        await Hospital.create({ name: name.trim(), address, contact });
        res.redirect('/admin/dashboard?msg=Hospital Added Successfully');
    } catch (err) {
        res.redirect('/admin/dashboard?msg=Error Adding Hospital');
    }
});

// HOSPITAL — UPDATE
router.post('/hospital/update/:id', async (req, res) => {
    try {
        const { name, address, contact } = req.body;

        // Validate phone
        if (contact && !/^\d{10}$/.test(contact)) {
            return renderDashboard(res, req, 'Phone number must be exactly 10 digits', true);
        }

        // Check duplicate name (excluding current hospital)
        const exists = await Hospital.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
        if (exists) {
            return renderDashboard(res, req, 'Hospital "' + name + '" already exists', true);
        }

        await Hospital.findByIdAndUpdate(req.params.id, { name: name.trim(), address, contact });
        res.redirect('/admin/dashboard?msg=Hospital Updated Successfully');
    } catch (err) {
        res.redirect('/admin/dashboard?msg=Error Updating Hospital');
    }
});

// HOSPITAL — DELETE
router.post('/hospital/delete/:id', async (req, res) => {
    try {
        // Also delete doctors and their slots under this hospital
        const docs = await Doctor.find({ hospital: req.params.id });
        for (let d of docs) {
            await Slot.deleteMany({ doctor: d._id });
        }
        await Doctor.deleteMany({ hospital: req.params.id });
        await Hospital.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard?msg=Hospital Deleted Successfully');
    } catch (err) {
        res.redirect('/admin/dashboard?msg=Error Deleting Hospital');
    }
});

// ========================
// DOCTOR — CREATE
// ========================
router.post('/doctors', async (req, res) => {
    try {
        const { name, specialty, hospitalId } = req.body;

        // Check duplicate: same name + same specialty + same hospital
        const exists = await Doctor.findOne({
            name: name.trim(),
            specialty: specialty.trim(),
            hospital: hospitalId
        });
        if (exists) {
            return renderDashboard(res, req, 'Doctor "' + name + '" with specialty "' + specialty + '" already exists in this hospital', true);
        }

        await Doctor.create({ name: name.trim(), specialty: specialty.trim(), hospital: hospitalId });
        res.redirect('/admin/dashboard?msg=Doctor Added Successfully');
    } catch (err) {
        res.redirect('/admin/dashboard?msg=Error Adding Doctor');
    }
});

// DOCTOR — UPDATE
router.post('/doctors/update/:id', async (req, res) => {
    try {
        const { name, specialty, hospitalId } = req.body;

        // Check duplicate (excluding current doctor)
        const exists = await Doctor.findOne({
            name: name.trim(),
            specialty: specialty.trim(),
            hospital: hospitalId,
            _id: { $ne: req.params.id }
        });
        if (exists) {
            return renderDashboard(res, req, 'Doctor "' + name + '" with specialty "' + specialty + '" already exists in this hospital', true);
        }

        await Doctor.findByIdAndUpdate(req.params.id, { name: name.trim(), specialty: specialty.trim(), hospital: hospitalId });
        res.redirect('/admin/dashboard?msg=Doctor Updated Successfully');
    } catch (err) {
        res.redirect('/admin/dashboard?msg=Error Updating Doctor');
    }
});

// DOCTOR — DELETE
router.post('/doctors/delete/:id', async (req, res) => {
    try {
        // Also delete all slots for this doctor
        await Slot.deleteMany({ doctor: req.params.id });
        await Doctor.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard?msg=Doctor Deleted Successfully');
    } catch (err) {
        res.redirect('/admin/dashboard?msg=Error Deleting Doctor');
    }
});

// ========================
// SLOT — CREATE
// ========================
router.post('/slots', async (req, res) => {
    try {
        const { doctorId, date, time } = req.body;

        // Check duplicate: same doctor + same date + same time
        const exists = await Slot.findOne({ doctor: doctorId, date, time });
        if (exists) {
            return renderDashboard(res, req, 'This doctor already has a slot at ' + time + ' on ' + new Date(date).toLocaleDateString('en-IN'), true);
        }

        await Slot.create({ doctor: doctorId, date, time });
        res.redirect('/admin/dashboard?msg=Slot Created Successfully');
    } catch (err) {
        res.redirect('/admin/dashboard?msg=Error Creating Slot');
    }
});

// SLOT — UPDATE
router.post('/slots/update/:id', async (req, res) => {
    try {
        const { doctorId, date, time } = req.body;

        // Check duplicate (excluding current slot)
        const exists = await Slot.findOne({
            doctor: doctorId, date, time,
            _id: { $ne: req.params.id }
        });
        if (exists) {
            return renderDashboard(res, req, 'This doctor already has a slot at ' + time + ' on ' + new Date(date).toLocaleDateString('en-IN'), true);
        }

        await Slot.findByIdAndUpdate(req.params.id, { doctor: doctorId, date, time });
        res.redirect('/admin/dashboard?msg=Slot Updated Successfully');
    } catch (err) {
        res.redirect('/admin/dashboard?msg=Error Updating Slot');
    }
});

// SLOT — DELETE
router.post('/slots/delete/:id', async (req, res) => {
    try {
        await Slot.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard?msg=Slot Deleted Successfully');
    } catch (err) {
        res.redirect('/admin/dashboard?msg=Error Deleting Slot');
    }
});

module.exports = router;
