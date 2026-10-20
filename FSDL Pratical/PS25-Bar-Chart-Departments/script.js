const ctx = document.getElementById("barChart");

new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["Computer", "IT", "Mechanical", "Civil", "Electronics"],
        datasets: [{
            label: "No. of Students",
            data: [120, 90, 70, 60, 80],
            backgroundColor: "red"
        }]
    }
});