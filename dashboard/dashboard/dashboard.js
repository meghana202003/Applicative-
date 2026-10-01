window.addEventListener("load", () => {

    const loader =
        document.getElementById("loader"); 

    if (loader) {  
        setTimeout(() => {
          loader.style.display = "none";

        }, 1000);kk
    }
});

render();

updateSummary();

updateCharts();

updateBudget();

updateHealth();

updateGoals();

updateInsights();