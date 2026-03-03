const axios = require('axios');
const mongoose = require('mongoose');

async function approveBob() {
    try {
        // 1. Get Coordinator Token
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: "admin@hit.ac.zw", password: "pass"
        });
        const token = loginRes.data.token;
        console.log("Got token");

        // 2. Approve Bob
        await axios.put('http://localhost:5000/api/users/companies/69a627ad7c218ff091810a0b/approve', {
            allocatedDepartments: ["Computer Science"]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Successfully approved Bob");
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}

approveBob();
