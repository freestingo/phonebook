const mongoose = require('mongoose')

if (process.argv.length < 3) {
	console.log('Please provide the password as an argument: node mongo.js <password>')
	process.exit(1)
}

const password = process.argv[2]

const url =
	`mongodb+srv://fullstack:${password}@cluster0.bgutp.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(
	url,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true
	}
)

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
})

const Person = mongoose.model('Person', personSchema)

const saveNewPerson = () => {
	const name = process.argv[3]
	const number = process.argv[4]
	const person = new Person({ name, number })

	person.save().then(result => {
		console.log(`Added ${name} (number ${number}) to the phonebook!`)
		mongoose.connection.close()
	})
}

const printPeople = () =>
	Person.find({})
		.then(result => {
			console.log('phonebook:')
			result.forEach(p => console.log(p.name, p.number))
			mongoose.connection.close()
		})

process.argv.length > 3
	? saveNewPerson()
	: printPeople()




