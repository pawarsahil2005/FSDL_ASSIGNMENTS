let students = [];
let marksChart, semesterChart, distributionChart;

async function loadData(){
    const response = await fetch("student.json");
    students = await response.json();

    const select = document.getElementById("studentSelect");

    students.forEach((student,index)=>{
        const option = document.createElement("option");
        option.value = index;
        option.textContent = student.name;
        select.appendChild(option);
    });

    loadStudent(0);
}

function calculateGPA(marks){
    let avg = marks.reduce((a,b)=>a+b)/marks.length;
    return (avg/10).toFixed(2);
}

function loadStudent(index){

const student = students[index];

// Attendance
document.getElementById("attendanceBar").style.width = student.attendance + "%";
document.getElementById("attendanceText").innerText =
"Attendance: " + student.attendance + "%";

let gpa = calculateGPA(student.marks);
document.getElementById("gpa").innerText = gpa;

let result = student.marks.some(m=>m<40) ? "Fail" : "Pass";
let resultElement = document.getElementById("result");
resultElement.innerText = result;
resultElement.className = result==="Pass" ? "pass" : "fail";

// Destroy previous charts
if(marksChart) marksChart.destroy();
if(semesterChart) semesterChart.destroy();
if(distributionChart) distributionChart.destroy();

// Marks Chart
marksChart = new Chart(document.getElementById("marksChart"),{
type:"bar",
data:{
labels:student.subjects,
datasets:[{
label:"Marks",
data:student.marks,
backgroundColor:"#2e99e1"
}]
}
});

// Semester Chart
semesterChart = new Chart(document.getElementById("semesterChart"),{
type:"line",
data:{
labels:["Sem 1","Sem 2","Sem 3","Sem 4"],
datasets:[{
label:"Average %",
data:student.semester,
borderColor:"#2ecc71",
backgroundColor:"rgba(46,204,113,0.2)",
fill:true,
tension:0.4
}]
}
});

// Distribution Chart
distributionChart = new Chart(document.getElementById("distributionChart"),{
type:"doughnut",
data:{
labels:["Distinction (75+)", "First Class (60-74)", "Below 60"],
datasets:[{
data:[
student.marks.filter(m=>m>=75).length,
student.marks.filter(m=>m>=60 && m<75).length,
student.marks.filter(m=>m<60).length
],
backgroundColor:["#1abc9c","#f1c40f","#e74c3c"]
}]
}
});

}

document.getElementById("studentSelect")
.addEventListener("change",function(){
loadStudent(this.value);
});

loadData();