const express = require('express')
const morgan = require('morgan')
const app = express()
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
morgan.token('resbody', (request, response) => JSON.stringify(response.customBody));
app.use(morgan(':method :url :status :response-time ms - :resbody'));

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456'
    },
    {
        id: 2,
        name: 'Ada Lovelace',
        number: '39-44-6231345'
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: '12-34-9824135'
    },
    {
        id: 4,
        name: 'Mary Poppendick',
        number: '39-23-4562623'
    }
]

app.get(
    '/info',
    (request, response) =>
        response.send(`
            <p>Phonebook has info for ${persons.length} people.</p>
            <p>${new Date()}</p>
        `)
)

app.get(
    '/api/persons',
    (request, response) => response.json(persons)
)

app.get(
    '/api/persons/:id',
    (request, response) => {
        const id = Number(request.params.id)
        const person = persons.find(p => p.id === id)
        
        person
            ? response.json(person)
            : response.status(400).end()
    }
)

const randomId = () =>
    Math.floor(Math.random() * 100)

app.post(
    '/api/persons',
    (request, response) => {
        const body = request.body
        
        if (!body.name || !body.number) {
            return response.status(400).json({
                error: `can't save entry with missing data!`
            })
        }

        if (persons.map(p => p.name).includes(body.name)) {
            return response.status(403).json({
                error: `person already exists in phonebook!`
            })
        }

        const person = {
            id: randomId(),
            name: body.name,
            number: body.number
        }
        persons = persons.concat(person)
        response.json(person)
    }
)

app.delete(
    '/api/persons/:id',
    (request, response) => {
        const id = Number(request.params.id)
        persons = persons.filter(p => p.id !== id)
        response.status(204).end()
    }
)

app.use(unknownEndpoint)

const PORT = 3001
app.listen(
    PORT,
    () => console.log(`Server running on port ${PORT}`)
)