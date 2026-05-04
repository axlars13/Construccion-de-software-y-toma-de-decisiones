const log = console.log;
const myForm = document.getElementById("myForm");
const submitButton = document.getElementById("submitButton");
const updateProductsButton = document.getElementById("updateProducts");
const wrapper = document.getElementById("wrapper");

window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
    columns: ["Id", "Name", "Price"],
    pagination: true,
    search: true,
    sort: true,
    server:{
    url: "/products",
    then: data => data.products
    }
}).render(wrapper);
});

submitButton.addEventListener("click", (event) => {
    event.preventDefault();
    var result = generateProduct();
    addProduct();
    loadProducts();
});

updateProductsButton.addEventListener("click", (event) => {
    loadProducts();
});

class Product {
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
}

function generateProduct(){
    const idInput = myForm.elements["id"];
    const nameInput = myForm.elements["name"];
    const priceInput = myForm.elements["price"];

    const id = idInput.value;
    const name = nameInput.value;
    const price = priceInput.value;
    
    var newProduct = null;
    var msg = "Created product";

    if(!id){
        msg = "Id is empty";
    }
    if(!name){
        msg = "Name is empty";
    }
    if(!price){
        msg = "Price is empty";
    }

    if(msg == "Created product"){
        newProduct = new Product(id, name, price);
    }

    return { product: newProduct, msg: msg }; 
}

async function addProduct(){
    const url = "/add_product";
    var data = JSON.stringify(generateProduct().product);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    });

    if(response.ok){
        const data = await response.json();
        log("Product added succesfully: " + data);
        //Clear the form or display a success message
    }else{
        alert("Error adding product: " + response.statusText);
    }
}

async function loadProducts(){
    let response = await fetch("/products");

    if(response.ok){
        let json = await response.json();
        const codeResult = document.getElementById("codeResult");

        codeResult.innerHTML = "";

        json.products.forEach(function(producto){
            codeResult.innerHTML += producto.id + " - " + producto.name + " - $" + producto.price + "<br>";
        });
    }else{
        alert("HTTP-Error: " + response.status);
    }
}

async function getProducts(){
    let response = await fetch("/products");

    if(response.ok){
        let json = await response.json();
        //log(json);
        return json.products;
    }else{
        return [];
    }
}
