// var mongoose = require('mongoose');

// let db = 'webwizards';
// let port = '27017';
// let host = '127.0.0.1';
// const dbURI = 'mongodb+srv://yovanniamador:FGxGGS4kJscJkvHU@cluster0.b8lblk3.mongodb.net/webwizards?retryWrites=true&w=majority';


// class Database {
//     constructor() {
//         this.conectar();
//     }

//     conectar() {
//         mongoose.connect(dbURI,{
//                 useNewUrlParser: true,
//                 useUnifiedTopology: true,
//             }).then(result => console.log('Se conectó a mongodb'))
//             .catch(error => console.log(error));
//     }
// }
// module.exports = new Database();


 var mongoose = require('mongoose');

let db = 'webwizards';
let port = '27017';
let host = '127.0.0.1';

class Database {
    constructor() {
        this.conectar();
    }
    
    conectar() {
        mongoose.connect(`mongodb://${host}:${port}/${db}`)
            .then(result => console.log('Se conectó a mongodb'))
            .catch(error => console.log(error));
    }
}
module.exports = new Database();
 