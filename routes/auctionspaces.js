// routes/auctionspaces.js
const express = require('express');
const router = express.Router();
const Auctionspace = require('../models/AuctionSpace');
const mongoose=require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Route to create a new Auction Space
router.post('/create', async (req, res) => {
    try {
        const { AuctionspaceId, AuctionSpaceName, host, phoneNo, franchises, AuctionDate } = req.body;
        const newAuctionSpace = new Auctionspace({
            AuctionspaceId,
            AuctionSpaceName,
            host,
            phoneNo,
            franchises,
            AuctionDate,
        });
        await newAuctionSpace.save();
        res.status(201).json(newAuctionSpace);
    } catch (error) {
        console.error('Error creating Auction Space:', error);
        res.status(500).json({ error: 'Error creating Auction Space' });
    }
});



router.post('/join', async (req, res) => {
    try {
        const { clientName, clientMail, franchiseName, AuctionspaceId } = req.body;

        // Find the Auctionspace by ID
        const auctionSpace = await Auctionspace.findOne({ AuctionspaceId });

        if (!auctionSpace) {
            return res.status(404).json({ error: 'Auction Space not found' });
        }

        // Add the client to the clients array
        auctionSpace.clients.push({
            email: clientMail,
            name: clientName,
            franchiseName,
        });

        await auctionSpace.save();

        res.status(200).json({ message: 'Joined Auction Space successfully' });
    } catch (error) {
        console.error('Error joining Auction Space:', error);
        res.status(500).json({ error: 'Error joining Auction Space' });
    }
});

// Assuming you have a route to fetch auction spaces based on user email
router.get('/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        // Fetch auction spaces where the user's email matches the host or clients' emails
        const auctionSpaces = await Auctionspace.find({
            $or: [{ host: email }, { 'clients.email': email }],
        });
        res.status(200).json(auctionSpaces);
    } catch (error) {
        console.error('Error fetching auction spaces:', error);
        res.status(500).json({ error: 'Error fetching auction spaces' });
    }
});

router.get('/:auctionSpaceId', async (req, res) => {
    const auctionSpaceId = req.params.auctionSpaceId;

    try {
        // Find the AuctionSpace by AuctionspaceId
        const auctionSpace = await Auctionspace.findOne({ AuctionspaceId: auctionSpaceId });

        if (!auctionSpace) {
            return res.status(404).json({ error: 'AuctionSpace not found' });
        }

        // AuctionSpace found, send it in the response
        res.status(200).json(auctionSpace);
    } catch (error) {
        console.error('Error fetching auction space:', error);
        res.status(500).json({ error: 'Error fetching auction space' });
    }
});

router.put('/players/:auctionSpaceId', async (req, res) => {
    const auctionSpaceId = req.params.auctionSpaceId;
    const newPlayer = req.body;

    try {
        const auctionSpace = await Auctionspace.findOne({ AuctionspaceId: auctionSpaceId });

        if (!auctionSpace) {
            return res.status(404).json({ error: 'AuctionSpace not found' });
        }

        // Validate the new player information
        if (!newPlayer.playername || !newPlayer.playerRole || !newPlayer.basePrice) {
            return res.status(400).json({ error: 'Player information is incomplete' });
        }

        // Add the new player to the players array
        auctionSpace.players.push(newPlayer);
        const updatedAuctionSpace = await auctionSpace.save();

        res.status(200).json(updatedAuctionSpace);
    } catch (error) {
        console.error('Error adding new player:', error);
        res.status(500).json({ error: 'Error adding new player' });
    }
});




let pendingRequests = [];


router.get('/:auctionSpaceId/pending-requests', async (req, res) => {
    const { auctionSpaceId } = req.params;

    try {
        // Sample logic to filter pending requests for the specified auction space
        const filteredRequests = pendingRequests.filter(request => request.AuctionspaceId === auctionSpaceId);

        // Send the filtered pending requests as the response
        res.status(200).json(filteredRequests);
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ error: 'Error fetching pending requests' });
    }
});

router.post('/:auctionSpaceId/pending-requests', async (req, res) => {
    const { auctionSpaceId } = req.params;
    const newRequest = req.body; // Assuming the client sends the new request data

    try {
        // Generate a unique requestId (you can use UUID or any other method)
        const requestId = uuidv4();

        // Add the new pending request to the array with the requestId
        pendingRequests.push({ ...newRequest, AuctionspaceId: auctionSpaceId, requestId });

        // Respond with the added request including the requestId
        res.status(201).json({ ...newRequest, AuctionspaceId: auctionSpaceId, requestId });
    } catch (error) {
        console.error('Error adding pending request:', error);
        res.status(500).json({ error: 'Error adding pending request' });
    }
});


router.put('/:auctionSpaceId/accept-request/:requestId', async (req, res) => {
    const { auctionSpaceId, requestId } = req.params;

    try {
        // Find the pending request by requestId
        const pendingRequestIndex = pendingRequests.findIndex(req => req.requestId === requestId);
        if (pendingRequestIndex === -1) {
            console.error('Join request not found');
            return res.status(404).json({ error: 'Join request not found' });
        }

        const pendingRequest = pendingRequests[pendingRequestIndex];
        const { clientName, clientMail, franchiseName } = pendingRequest; // Destructure required fields

        const auctionSpace = await Auctionspace.findOne({ AuctionspaceId: auctionSpaceId });
        if (!auctionSpace) {
            console.error('Auction space not found');
            return res.status(404).json({ error: 'Auction space not found' });
        }
        const existingClientIndex = auctionSpace.clients.findIndex(client => client.email === clientMail);
        if (existingClientIndex !== -1) {
            console.log('Client already exists, updating data...');
            // Update existing client data if necessary
            auctionSpace.clients[existingClientIndex].name = clientName;
            auctionSpace.clients[existingClientIndex].franchiseName = franchiseName;
        } else {
            // Add the client to the Auctionspace
            auctionSpace.clients.push({
                email: clientMail,
                name: clientName,
                franchiseName,
            });
        }
        // Save the updated auction space
        const updatedAuctionSpace = await auctionSpace.save();

        // Remove the accepted request from the pendingRequests array
        pendingRequests.splice(pendingRequestIndex, 1);

        res.status(200).json({ message: 'Join request accepted successfully' });
    } catch (error) {
        console.error('Error accepting join request:', error);
        res.status(500).json({ error: 'Error accepting join request' });
    }
});



router.put('/:auctionSpaceId/decline-request/:requestId', async (req, res) => {
    const { auctionSpaceId, requestId } = req.params;
    try {
        // Update the status of the request to declined
        const updatedRequests = pendingRequests.filter(req => !(req.AuctionspaceId === auctionSpaceId && req.requestId === requestId));
        // Update the pendingRequests array with the updated request status
        pendingRequests = updatedRequests;

        res.status(200).json({ message: 'Join request declined successfully' });
    } catch (error) {
        console.error('Error declining join request:', error);
        res.status(500).json({ error: 'Error declining join request' });
    }
});



module.exports = router;
