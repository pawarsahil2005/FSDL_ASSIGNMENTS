// json dataset
let products = [ 
{ 
name: "Laptop", 
price: "50000", 
image: "https://via.placeholder.com/250" 
}, 
{ 
name: "Smartphone", 
price: "25000", 
image: "https://via.placeholder.com/250" 
}, 
{ 
name: "Headphones", 
price: "3000", 
image: "https://via.placeholder.com/250" 
} 
]; 

let container = document.getElementById("productGallery");

products.forEach(function(product){
    let card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
    <img src="${product.image}">
    <h3>${product.name}</h3>
    <p>Rs. ${product.price}</p>
    <button onClick="buyNow('${product.name}')">Buy Now</button>
    `;
    container.appendChild(card);
});

function buyNow(productName) { 
alert(productName + " added for purchase!"); 
} 