require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')
const unknownEndpoint = (request, response, next) =>
    response.status(404).send({error: 'unknown endpoint'})

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
    (request, response) =>
        Person.findById(request.params.id)
            .then(person => response.json(person))
)

app.post(
    '/api/people',
    (request, response) => {
        const body = request.body
        
        if (!body.name || !body.number) {
            return response.status(400).json({
                error: `can't save entry with missing data!`
            })
        }

        const person = new Person({
            name: body.name,
            number: body.number
        })
        person.save().then(savedPerson => response.json(savedPerson))
    }
)

app.delete(
    '/api/people/:id',
    (request, response) =>
        Person.findByIdAndDelete(request.params.id)
            .then(note => response.status(204).end())
)

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(
    PORT,
    () => console.log(`Server running on port ${PORT}`)
)