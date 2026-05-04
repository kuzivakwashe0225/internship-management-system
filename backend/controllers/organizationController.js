const Organization = require('../models/Organization');

exports.createOrganization = async (req, res) => {
    try {
        const { name, address, contactPerson, email, industry } = req.body;

        if (!name || !address || !contactPerson || !email || !industry) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const organization = await Organization.create({
            name,
            address,
            contactPerson,
            email,
            industry
        });

        res.status(201).json(organization);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

exports.getOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find().sort('industry name');
        res.json(organizations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteOrganization = async (req, res) => {
    try {
        const organization = await Organization.findByIdAndDelete(req.params.id);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.json({ message: 'Organization deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
