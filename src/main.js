import {promises as fs} from 'fs'
import express from 'express';
const app = express()
app.use(express.json())

const PORT = 4000

class Product {
    constructor(id, title, description, price, thumbnail, code, stock) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.code = code;
        this.stock = stock;
    }
}

export class ProductManager {
    constructor() {
        this.products = [];
        this.nextId = 0;
        this.path = './productos.json'

    }

    
    saveToFile = async() => {
        try {
            await fs.writeFile(this.path, JSON.stringify(this.products,null,2));
        } catch (error) {
            console.log('Error al guardar en el archivo:', error);
        }
    }

    recoverProducts = async() => {       
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            if (data && data.length > 0) {
                this.products = JSON.parse(data);
                const maxIdProduct = this.products.reduce((prev, curr) => (prev.id > curr.id) ? prev : curr);
                this.nextId = maxIdProduct.id + 1;
            } else {
                this.products = [];
                this.nextId = 0;
            }
            
        } catch (error) {
            if (error.code !== 'ENOENT') { // ENOENT es el error que se lanza si el archivo no existe
                console.log('Error al leer el archivo:', error);
                this.products = [];
                this.nextId = 0;
            }
        }
        }


    addProduct = async(title, description, price, thumbnail, code, stock) => {
        await this.recoverProducts();
        if(!title || !description || !price || !thumbnail || !code || !stock){
            console.log('Todos los campos son obligatorios');
            return { success: false, message: "todos los campos son obligatorios" };
        }
        // Verifica si el código ya existe
        const duplicateCode = this.products.some(product => product.code === code);
        if(duplicateCode){
            console.log('El código ya existe');
            return { success: false, message: "El código ya existe" };
        }
        const product = new Product(this.nextId++, title, description, price, thumbnail, code, stock);
        this.products.push(product);
        // Guarda el producto en el archivo
        await fs.writeFile(this.path, JSON.stringify(this.products,null,2));
        return { success: true, message: "Producto añadido correctamente" };
    }

    getProducts = async() => {
        await this.recoverProducts();
        return this.products;
    }
    
    removeProduct = async(code) => {

        const index = await this.products.findIndex(product => product.code === code);
        if (index !== -1) {
            this.products.splice(index, 1);
        } else {
            console.log('Producto no encontrado');
        }
    }

    updateProduct = async(code, updatedProduct) => {
        const index = await this.products.findIndex(product => product.code === code);
        if (index !== -1) {
            this.products[index] = {...this.products[index], ...updatedProduct};
        } else {
            console.log('Producto no encontrado');
        }
    }

    getProductById = async(id) => {
        await this.recoverProducts();
        //let resProductById = await this.readProducts()
        const product = this.products.find(product => product.id === id);
        if (product) {
            return product;
        } else {
            console.log('Producto no encontrado');
        }
    }
}

const manager = new ProductManager();

// SERVIDOR 
app.get('/products', async (req, res) => {
    let limit = parseInt(req.query.limit);
    console.log(limit)
    if(limit){
    let allproducts = await (await manager.getProducts()).slice(0,limit)
    res.send(await allproducts);
    } else {
        res.send(await manager.getProducts());
    }
    
})

app.get('/products/:id', async (req, res) => {
    
    res.send(await manager.getProductById(parseInt(req.params.id)))
})

app.post('/products', async (req, res) => {
    console.log(req.body);
    const { title, description, price, thumbnail, code, stock } = req.body;
    res.send(await manager.addProduct(title, description, price, thumbnail, code, stock));
    // const producto = prods.find( prod => prod.code === req.body.code)

    // if(producto){
    //     res.status(400).send("producto ya existente")
    // } else  {
    //     prods.push(req.body)
    //     res.status(200).send("producto creado")
    // }

    // console.log(prods)
})


const server = app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`)
})
server.on("error", (error) => console.log(`Error en servidor ${error}`))
//manager.getProducts()

// 1era etapa de Testing

// const productos = manager.getProducts();
// console.log("primera muestra de productos",products);
//manager.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin imagen", "abc124", 25);
//manager.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin imagen", "abc123", 25);
// manager.getProducts()


// // Segunda etapa de testing 

// manager.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin imagen", "abc123", 25);


// // Tercera etapa de testing - codigo duplicado
// manager.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin imagen", "abc124", 25);
// manager.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin imagen", "abc123", 25);
//manager.addProduct("productazo", "Nuevo producto prueba", 500, "Sin imagen", "abc150", 50);
// manager.addProduct("productazaaa", "Nuevo producto prueba", 500, "Sin imagen", "abc151", 50);

// // Cuarta etapa de testing - codigo duplicado
// manager.getProductById(3)
// console.log("segunda muestra de productos",products);

// const runAsyncOperations = async () => {
//     const manager = new ProductManager();
//     await manager.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin imagen", "abc124", 25);
//     await manager.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin imagen", "abc123", 25);
//     const products = await manager.getProducts();
//     console.log(products);
// }

// runAsyncOperations();