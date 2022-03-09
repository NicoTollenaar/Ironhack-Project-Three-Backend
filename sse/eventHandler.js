let serverSentResponse = {};

async function eventHandler(req, res) {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
  };

  serverSentResponse = res;

  res.writeHead(200, headers);
 
}

module.exports = { eventHandler, serverSentResponse };


 //   let counter = 0;
  //   const intervalId = setInterval(() => {
  //     console.log(
  //       "In eventhandler in setInternval, should be loggin every second"
  //     );
  //     counter++;
  //     if (counter >= 10) {
  //       clearInterval(intervalId);
  //       res.end();
  //       return;
  //     }
  //     res.write(`data: ${JSON.stringify({ num: counter })}\n\n`);
  //   }, 5000);
