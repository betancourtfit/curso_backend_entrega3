// import http from 'http'

// const PORT = 40000
// //req = request y res = response
// const server = http.createServer((req, res) => {
//     res.end("Hola, buenos dias")
// })

// //Iniciar mi servidor
// server.listen(PORT, () => {
//     console.log(`Server on port ${PORT}`)
// })

import express from 'express';
const app = express()
app.use(express.json())

const PORT = 4000
//Genero una instancia de express en app


const prods = [
    { id: 1, nombre: "Papas Fritas", categoria: "Snacks", code:"S1" },
    { id: 2, nombre: "Lentejas", categoria: "Legumbres", code:"L1" },
    { id: 3, nombre: "Nachos", categoria: "Snacks", code:"S2" }
]

app.get('/', (req, res) => {
    res.send("Hola, buenos dias")
})

app.get('/products', (req, res) => {
    console.log(req.query)
    const { categoria } = req.query
    if (categoria) {
        const products = prods.filter(prod => prod.categoria === categoria)
        //const products = prods.filter(prod => prod.categoria === categoria[0] || prod.categoria === categoria[1])
        res.send(products)
    }

    res.send(prods) //Siempre retorno en formato String (JSON en este caso)

})

app.get('/products/:id', (req, res) => {
    const prod = prods.find(prod => prod.id === parseInt(req.params.id))

    if (prod)
        res.send(prod)
    else
        res.send("Producto no existente")
})

app.post('/products', (req, res) => {

    const producto = prods.find( prod => prod.code === req.body.code)

    if(producto){
        res.status(400).send("producto ya existente")
    } else  {
        prods.push(req.body)
        res.status(200).send("producto creado")
    }

    console.log(prods)
})

app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`)
})