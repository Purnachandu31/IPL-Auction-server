// models/auctionspace.js
const mongoose = require('mongoose');

const auctionspaceSchema = new mongoose.Schema({
    AuctionspaceId: { type: String, required: true, unique: true },
    AuctionSpaceName: { type: String, required: true, unique: true },
    host: { type: String, required: true },
    phoneNo: { type: String, required: true },
    franchises: { type: Number, required: true },
    AuctionDate: { type: Date, required: true },
    clients: [{
        email: { type: String, required: true,unique:true },
        name: { type: String, required: true },
        franchiseName: { type: String, required: true },
    }],
    players: [{
        playername: { type: String, required: true,unique:true },
        playerRole: { type: String, required: true },
        isForeignPlayer: { type: Boolean, default: false },
        basePrice: { type: Number, required: true },
    }],
});

const Auctionspace = mongoose.model('Auctionspace', auctionspaceSchema);

module.exports = Auctionspace;
