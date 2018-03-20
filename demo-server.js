const express = require('express');
const app = express();

app.use('/dist', express.static(__dirname + '/dist'));
app.use('/demo', express.static(__dirname + '/demo'));
app.use('/res', express.static(__dirname + '/res'));

// send demo template file
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/demo/index.html');
});

app.listen(3000, () => {
	console.log('Demo server listening on port 3000, http://localhost:3000');
});