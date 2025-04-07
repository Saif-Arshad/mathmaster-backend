
const UserModel2 = require('../models/User');
const db7 = require('../config/db');
const PDFDocument = require('pdfkit');
const userController = {
    getProfile: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const user = await UserModel2.findById(user_id);
            if (!user) return res.status(404).json({ message: 'User not found.' });

            delete user.password;
            user.progress = 0;

            res.json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get profile.' });
        }
    },
    getUserInfo: async (req, res) => {
        try {
            const { id } = req.params;
            console.log("🚀 ~ getUserInfo: ~ id:", id)
            const user_id = Number(id);
            const user = await UserModel2.findById(user_id);
            if (!user) return res.status(404).json({ message: 'User not found.' });

            delete user.password;
         
                user.progress = 0;
            user.progressData = await db7.performance.findMany({
                where: {
                    user_id,
                },
                include: {
                    level: true
                }
            })

            res.json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on get profile.' });
        }
    },


    logout: async (req, res) => {
        try {
            res.json({ message: 'Logged out successfully (client should remove token).' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error on logout.' });
        }
    },

    updateInitialPercentage: async (req, res) => {
        try {
            const { user_id, percentage } = req.body;
            if (!user_id || typeof percentage === 'undefined')
                return res.status(400).json({ message: 'User id and percentage are required.' });
            const parsedPercentage = parseInt(percentage, 10);
            if (isNaN(parsedPercentage))
                return res.status(400).json({ message: 'Percentage must be a number.' });
            const updated = await db7.users.update({
                where: { user_id },
                data: { initialPercentage: parsedPercentage }
            });
            if (!updated) return res.status(404).json({ message: 'User not found.' });
            res.json({ message: 'User initial percentage updated successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error while updating initial percentage.' });
        }
    },
    generateUserReport : async (req, res) => {
        try {
            const { id } = req.params;
            console.log("🚀 ~ generateUserReport: ~ id:", id)
            const user_id = id
            if (!user_id) {
                return res.status(400).json({ message: 'User id is required.' });
            }
    
            const user = await db7.users.findUnique({
                where: { user_id: Number(user_id) },
                include: {
                    performance: {
                        include: {
                            level: true,
                        },
                    },
                },
            });
    
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
    
            const doc = new PDFDocument({ margin: 50 });
    
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=report_user_${user_id}.pdf`);
    
            doc.pipe(res);
    
            doc.fontSize(25)
                .fillColor('#333')
                .text('User Performance Report', { align: 'center' });
            doc.moveDown(2);
    
            doc.fontSize(18)
                .fillColor('#000')
                .text('User Information', { underline: true });
            doc.moveDown();
    
            doc.fontSize(12)
                .text(`Username: ${user.username}`)
                .text(`Email: ${user.email}`)
                .text(`Age: ${user.age}`)
                .text(`Initial Percentage: ${user.initialPercentage || 'N/A'}`)
                .text(`Current Level: ${user.currentLevel || 'N/A'}`);
            doc.moveDown(2);
    
            doc.fontSize(18)
                .text('Quiz Performances', { underline: true });
            doc.moveDown();
    
            if (user.performance.length === 0) {
                doc.fontSize(12).text('No quiz performance records available.');
            } else {
                user.performance.forEach((perf, index) => {
                    doc.fontSize(14)
                        .fillColor('#00529B')
                        .text(`Quiz ${index + 1}:`, { continued: true })
                        .fillColor('#000')
                        .text(` Level: ${perf.level.level_name}`);
                    doc.fontSize(12)
                        .text(`   Score: ${perf.quiz_score}%`)
                        .text(`   Correct Answers: ${perf.correct_answers} / ${perf.total_questions}`)
                        .text(`   Result: ${perf.isFailed ? 'Fail' : 'Pass'}`);
                    doc.moveDown();
                });
            }
    
            doc.end();
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error while generating report.' });
        }
    },
};
module.exports = userController;