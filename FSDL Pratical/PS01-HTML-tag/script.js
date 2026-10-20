document.getElementById("searchBar").addEventListener("keyup",searchCheck);

function searchCheck(){
    let input = document.getElementById("searchBar").value.toLowerCase();
    let rows = document.querySelectorAll("#tagTable tbody tr");

    rows.forEach(function(row){
        let text = row.innerText.toLowerCase();

        if(text.includes(input))
        {
            row.style.display = "";
        }else{
            row.style.display = "none";
        }
    });
}