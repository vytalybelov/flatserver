const express = require('express');
const config = require('./config');
const Node = require('./node');
const Poller = require('./poller');

const app = express();
app.use(express.static(__dirname + '/public'));

const refresh_interval = config.refresh_interval;
const nodes_count = config.nodes_count;
const nodes = new Array(nodes_count);
const target_net = config.target_net;

for(var currNode = 0; currNode < nodes_count; currNode++) {
    nodes[currNode] = new Node(target_net + String(currNode + 1));
}

console.log(`Nodes length: ${nodes.length}`);

const poller = new Poller(nodes);
poller.start();
setInterval(() => {poller.start();}, refresh_interval * 1000);

app.set("view engine", "pug");
const pug = require('pug');
const compiledPug = pug.compileFile('./views/nodes.pug');

app.use("/", (request, response) => {
     response.send(compiledPug({
        title: target_net,
        nodes: nodes,
        nodes_off: poller._offline_count,
        nodes_on: poller._online_count,
        refresh_interval: refresh_interval
    }));
 });
 
app.listen(3000);