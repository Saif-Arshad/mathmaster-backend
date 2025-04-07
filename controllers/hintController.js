const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const hintController = {

    async createHint(req, res) {
        try {
            const { game, operation, image } = req.body;

            if (!game || !operation) {
                return res.status(400).json({ message: 'Game and operation are required.' });
            }

            const newHint = await prisma.hint.create({
                data: {
                    game,
                    operation,
                    image, 
                },
            });

            res.status(201).json({
                message: 'Hint created successfully.',
                hint_id: newHint.hint_id,
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Server error while creating hint.' });
        }
    },

  
    async getHints(req, res) {
        try {
            const hints = await prisma.hint.findMany();
            res.status(200).json(hints);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Server error while retrieving hints.' });
        }
    },

    async getHintById(req, res) {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid hint ID.' });
            }

            const hint = await prisma.hint.findUnique({
                where: { hint_id: id },
            });

            if (hint) {
                res.status(200).json(hint);
            } else {
                res.status(404).json({ message: 'Hint not found.' });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Server error while retrieving hint.' });
        }
    },

 
    async updateHint(req, res) {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid hint ID.' });
            }

            const { game, operation, image } = req.body;

            const updatedHint = await prisma.hint.update({
                where: { hint_id: id },
                data: {
                    game,
                    operation,
                    image, 
                },
            });

            res.status(200).json({
                message: 'Hint updated successfully.',
                hint: updatedHint,
            });
        } catch (e) {
            if (e.code === 'P2025') {
                res.status(404).json({ message: 'Hint not found.' });
            } else {
                console.error(e);
                res.status(500).json({ message: 'Server error while updating hint.' });
            }
        }
    },

    async deleteHint(req, res) {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid hint ID.' });
            }

            await prisma.hint.delete({
                where: { hint_id: id },
            });

            res.status(200).json({ message: 'Hint deleted successfully.' });
        } catch (e) {
            if (e.code === 'P2025') {
                res.status(404).json({ message: 'Hint not found.' });
            } else if (e.code === 'P2003') {
                res.status(400).json({
                    message: 'Cannot delete hint because it is referenced by questions.',
                });
            } else {
                console.error(e);
                res.status(500).json({ message: 'Server error while deleting hint.' });
            }
        }
    },
};

module.exports = hintController;