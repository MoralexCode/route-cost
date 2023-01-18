// this is for assign the value of the params to  model to send DB
// this save time : example book.nama= params.name
function asignarLlaveValor(modelo, key, values) {
    for (var i = key.length - 1; i >= 0; i--) {
        modelo[key[i]] = values[key[i]]
    }
}

function validarNull(key, array) {
    console.log('Array  : ', array)
    for (var i = key.length - 1; i >= 0; i--) {
        console.log(i, array[key[i]])
        if (array[key[i]] == null) { //|| array[key[i]] == undefined || array[key[i]] == '') { // array[key[i]] ||
            console.log('el valor es null : ', key[i], array)
            return false;
        }
    }
    return true;
}

function message(respuesta, data, message) {
    respuesta.status(200).send({
        response: data,
        message,
        successfull: true,
    })
}

function dataValidation(res, data, controllerName) {
    if (data) {
        message(res, data)
    } else {
        message(res, data, notFoundMessage(controllerName));
    }
}

function notFoundMessage(modelName) {
    return modelName.substring(0, modelName.length - 10).toUpperCase() + " not found."
}

function errorMessage(respuesta, mensaje) {
    respuesta.status(200).send({
        response: {
            code: 503,
            msg: mensaje
        }
    })
}

function parseDateFormat(fecha) {
    var newFecha = new Date(fecha)
    return newFecha.getFullYear() + '/' + completa((newFecha.getMonth()) + 1) + '/' + completa(newFecha.getDate())
}

function DDMMYYYYDateFormat(fecha) {
    var newFecha = new Date(fecha)
    return completa(newFecha.getDate()) + '/' + completa((newFecha.getMonth()) + 1) + '/' + newFecha.getFullYear()
}

function completa(value) {
    if (value < 9) {
        return '0' + value
    }
    return value
}

function replaceSpace(string) {
    var words = string.split(' '),
        newWords = ''
    words.forEach(ele => {
        newWords += ele + '%20'
    })
    return newWords
}

function depurar(cities) {
    var newCities = []
    cities.forEach(element => {
        if (element.country = 'MX') {
            newCities.push(element)
        }
    });
    return newCities
}


function floatValidation(number) {
    if (!isNaN(number)) {
        try {
            if (parseFloat(number)) {
                return true
            } else {
                return false
            }
        } catch (error) {
            return false
        }
    }
    return false
}



module.exports = {
        asignarLlaveValor,
        validarNull,
        message,
        parseDateFormat,
        errorMessage,
        DDMMYYYYDateFormat,
        replaceSpace,
        floatValidation,
        dataValidation,
        notFoundMessage
    }
    /***
* 	Thunderstorm
Drizzle
Rain
Snow
Atmosphere
Clear
Clouds
*/