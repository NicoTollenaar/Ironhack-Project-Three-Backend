async function blockchainEventHandler(req, res, next) {
  console.log("In blockchainEventHandler, logging req.body: ", req.body);
    res.json(req.body);
    return sendToClient(req.body);
}

module.exports = blockchainEventHandler;
