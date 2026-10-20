const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Slot = require('../models/Slot');
const Appointment = require('../models/Appointment');

// All user routes require login
router.use(verifyToken);

// ========================
// USER DASHBOARD
// ========================
router.get('/dashboard', async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        const doctors = await Doctor.find().populate('hospital');
        const availableSlots = await Slot.find({ isBooked: false }).populate({
            path: 'doctor',
            populate: { path: 'hospital' }
        });

        const appointments = await Appointment.find({ patient: req.user.id })
            .populate({
                path: 'slot',
                populate: { path: 'doctor', populate: { path: 'hospital' } }
            });

        res.render('user-dashboard', {
            user: req.user,
            hospitals,
            doctors,
            availableSlots,
            appointments,
            msg: req.query.msg || null
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ========================
// BOOK APPOINTMENT (ATOMIC — no double booking)
// ========================
router.post('/appointments', async (req, res) => {
    try {
        const { slotId } = req.body;

        // Step 1 & 2: ATOMIC MongoDB operation
        // findOneAndUpdate checks isBooked=false AND sets it to true in ONE operation
        // This prevents double booking even if two users click at same time
        const lockedSlot = await Slot.findOneAndUpdate(
            { _id: slotId, isBooked: false },
            { isBooked: true },
            { new: true }
        );

        if (!lockedSlot) {
            return res.redirect('/user/dashboard?msg=Slot Already Booked — Double Booking Prevented');
        }

        // Step 3: Create the appointment
        await Appointment.create({
            patient: req.user.id,
            slot: lockedSlot._id
        });

        res.redirect('/user/dashboard?msg=Appointment Booked Successfully!');
    } catch (err) {
        res.redirect('/user/dashboard?msg=Error During Booking');
    }
});

// ========================
// RESCHEDULE APPOINTMENT
// ========================
router.post('/appointments/reschedule/:id', async (req, res) => {
    try {
        const { newSlotId } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.redirect('/user/dashboard?msg=Appointment Not Found');

        // Step 1: Free the old slot
        await Slot.findByIdAndUpdate(appointment.slot, { isBooked: false });

        // Step 2: Atomically lock the new slot
        const newSlot = await Slot.findOneAndUpdate(
            { _id: newSlotId, isBooked: false },
            { isBooked: true },
            { new: true }
        );

        if (!newSlot) {
            // Rollback — re-lock the old slot
            await Slot.findByIdAndUpdate(appointment.slot, { isBooked: true });
            return res.redirect('/user/dashboard?msg=New Slot Already Booked — Reschedule Failed');
        }

        // Step 3: Update appointment to new slot
        appointment.slot = newSlot._id;
        await appointment.save();

        res.redirect('/user/dashboard?msg=Appointment Rescheduled Successfully!');
    } catch (err) {
        res.redirect('/user/dashboard?msg=Error During Reschedule');
    }
});

// ========================
// CANCEL APPOINTMENT
// ========================
router.post('/appointments/cancel/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.redirect('/user/dashboard?msg=Appointment Not Found');

        // Free the slot back
        await Slot.findByIdAndUpdate(appointment.slot, { isBooked: false });

        // Delete the appointment from MongoDB
        await Appointment.findByIdAndDelete(appointment._id);

        res.redirect('/user/dashboard?msg=Appointment Cancelled — Slot Freed Successfully');
    } catch (err) {
        res.redirect('/user/dashboard?msg=Error Cancelling Appointment');
    }
});

module.exports = router;
