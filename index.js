require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

/*
    overwriting express send function and adding a
    customBody field to the response object
*/
const originalSend = app.response.send
app.response.send = function sendOverWrite(body) {
	originalSend.call(this, body)
	this.customBody = body
}

app.use(express.json())
morgan.token('resbody', (request, response) => JSON.stringify(response.customBody))
app.use(morgan(':method :url :status :response-time ms - :resbody'))
app.use(cors())
app.use(express.static('build'))

app.get(
	'/info',
	(request, response) =>
		Person.find({})
			.then(people =>
				response.send(`
					<p>Phonebook has info for ${people.length} people.</p>
					<p>${new Date()}</p>
				`)
			)
)

app.get(
	'/api/people',
	(request, response) =>
		Person.find({}).then(people => response.json(people))
)

app.get(
	'/api/people/:id',
	(request, response, next) =>
		Person.findById(request.params.id)
			.then(person =>
				person
					? response.json(person)
					: response.status(404).end()
			)
			.catch(error => next(error))
)

app.put(
	'/api/people/:id',
	(request, response, next) => {
		const body = request.body

		const person = {
			name: body.name,
			number: body.number,
		}

		Person.findByIdAndUpdate(request.params.id, person, { runValidators: true, context: 'query', new: true })
			.then(updatedPerson => response.json(updatedPerson))
			.catch(error => next(error))
	})

app.post(
	'/api/people',
	(request, response, next) => {
		const body = request.body

		const person = new Person({
			name: body.name,
			number: body.number
		})

		person.save()
			.then(savedPerson => response.json(savedPerson))
			.catch(error => next(error))
	}
)

app.delete(
	'/api/people/:id',
	(request, response, next) =>
		Person.findByIdAndDelete(request.params.id)
			.then(result => response.status(204).end())
			.catch(error => next(error))
)

const unknownEndpoint = (request, response, next) =>
	response.status(404).send({ error: 'unknown endpoint' })
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	}

	next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(
	PORT,
	() => console.log(`Server running on port ${PORT}`)
)