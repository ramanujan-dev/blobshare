const express = require('express');

class DBACTION {
    constructor() {
        this.mongoose = require("mongoose");
        this.db = require("./db")
        this.Moniker = require('moniker');
        this.crypto = require('crypto');
        this.mongoose.connect(
            "mongodb://0.0.0.0:27017/knobdrop",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        )
    }
    generate_key = function () {
        return this.crypto.randomBytes(16).toString('base64');
    };

    addUser = async (network) => {
        do {
            var name = this.Moniker.choose();
        }
        while ((await this.db.Peer.find({ name: name })).length != 0)

        do {
            var session = this.generate_key();
        }
        while ((await this.db.Peer.find({ session: session })).length != 0)

        let peernew = new this.db.Peer({ session: session, name: name })
        await peernew.save();
        var networkgroup = await this.db.NetworkGroup.find({
            $or: [
                { addr4: network['ipv4'] },
                { addr6: network['ipv6'] }
            ]
        })
        let networkgroupLen = networkgroup.length
        if (networkgroupLen == 0) {
            networkgroup = new this.db.NetworkGroup({ addr4: network['ipv4'],addr6: network['ipv6'], peers: [peernew] })
            await networkgroup.save();
        }
        else {

            await this.db.NetworkGroup.updateOne({ 
                $or : [
                    {addr4:network['ipv4']},
                    {addr6:network['ipv6']}
                ]
             },
                {
                    $set:{
                        addr4:network['ipv4'],
                        addr6:network['ipv6']
                    },
                    $push: {
                        peers: peernew
                    }
                }
            ).exec()

        }


        var networkgroup = await this.db.NetworkGroup.findOne({ 
            $or : [
                {addr4:network['ipv4']},
                {addr6:network['ipv6']},
            ]
         })

        return { peer: peernew, network: networkgroup }
    }

    updateNetwork = async (peer, sdp) => {
        await this.db.Peer.updateOne({
            session: peer.session
        },
            {
                $set: {
                    sdp: sdp
                }
            }).exec()
    }

    popPeer = async (network, peer) => {
        await this.db.NetworkGroup.updateOne(
            {
                $or : [
                    {addr4:network.addr4},
                    {addr6:network.addr6}
                ]
            },
            {
                $pullAll: {
                    peers: [{ _id: peer._id }]
                }
            }).exec()
        let netgrp = await this.db.NetworkGroup.findOne(
            { 
                $or : [
                    {addr4:network.addr4},
                    {addr6:network.addr6}
                ]
            }
        ).exec();
        if (netgrp.peers.length == 0) {
            await netgrp.deleteOne()
        }
        await this.db.Peer.deleteMany({
            _id: peer._id
        }).exec()
    }

    getNetworkPeers = async (network, currPeer) => {

        var peersDB = (await this.db.NetworkGroup.findOne({ $or : [
            {addr4:network.addr4},
            {addr6:network.addr6}
        ] })).peers
        var currentSession = currPeer.session
        var peers = []
        for (let i = 0; i < peersDB.length; i++) {
            var peer = await this.db.Peer.findOne({ _id: peersDB[i]._id })
            if (peer.session != currentSession) {
                peers.push(peer)
            }
        }
        return peers
    }

    deleteAll = async () => {
        await this.db.NetworkGroup.deleteMany().exec();
        await this.db.Peer.deleteMany().exec();
    }

    getPeer = async (name) => {
        return await this.db.Peer.findOne({ name: name }).exec()
    }

}

var app = express();


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/templates/index.html')
});

app.use(express.static(__dirname + '/static'))

module.exports = { app: app, DBACTION: DBACTION };