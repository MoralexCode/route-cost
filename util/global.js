'use strict';
const error = console.error;
const send = (respuesta, data, message, codeResponse) => {
	respuesta.status(codeResponse || 200).send({
		codeResponse,
		data,
		message,
		successfull: true
	});
};

const sendError = (respuesta, data, message, codeResponse) => {
	error('Error values | ', data);
	respuesta.status(codeResponse || 500).send({
		codeResponse,
		data,
		message,
		successfull: false
	});
};

const readMessage = (modelName, error) => {
	return (
		'An error has occurred to get  ' +
		modelName.substring(0, modelName.length - 10).toUpperCase() +
		' : ' +
		error
	);
};

function notFoundMessage(modelName) {
	return modelName.substring(0, modelName.length - 10).toUpperCase() + ' not found.';
}

const dataValidation = (res, data, controllerName) => {
	if (data) {
		send(res, data);
	} else {
		send(res, data, notFoundMessage(controllerName));
	}
};

const floatValidation = number => {
	if (!isNaN(number)) {
		try {
			if (parseFloat(number)) {
				return true;
			} else {
				return false;
			}
		} catch (error) {
			return false;
		}
	}
	return false;
};

module.exports = global.send = send;
module.exports = global.sendError = sendError;
module.exports = global.readMessage = readMessage;
module.exports = global.dataValidation = dataValidation;
module.exports = global.floatValidation = floatValidation;
