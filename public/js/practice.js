document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.querySelector('.challenge-table tbody');
    const searchInput = document.getElementById('search-bar');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');

    let selectedDifficulty = '';

    // Modal elements
    const modal = document.getElementById('problem-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalInput = document.getElementById('modal-input');
    const modalOutput = document.getElementById('modal-output');
    const modalClose = modal.querySelector('.close');

    modalClose.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    // Fetch all problems
    async function fetchProblems() {
        try {
            const res = await fetch('/api/practice/problems');
            const data = await res.json();
            if (data.success) return data.data;
            console.error('Failed to fetch problems:', data.error);
            return [];
        } catch (err) {
            console.error('Error fetching problems:', err);
            return [];
        }
    }

    // Map difficulty to CSS class
    function getDifficultyClass(diff) {
        switch (diff.toLowerCase()) {
            case 'easy': return 'difficulty-beginner';
            case 'medium': return 'difficulty-intermediate';
            case 'hard': return 'difficulty-advanced';
            default: return '';
        }
    }

    // Filter problems by search & difficulty
    function filterProblems(problems, query, difficulty) {
        return problems.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(query.toLowerCase());
            const matchesDifficulty = difficulty ? p.difficulty === difficulty : true;
            return matchesSearch && matchesDifficulty;
        });
    }

    // Render table and attach click event for modal
    async function renderTable(problems) {
        tableBody.innerHTML = '';

        problems.forEach(problem => {
            const row = document.createElement('tr');
            row.classList.add('challenge-row');
            row.innerHTML = `
                <td>${problem.title}</td>
                <td class="${getDifficultyClass(problem.difficulty)}">${problem.difficulty}</td>
            `;

            // Show modal on click
            row.addEventListener('click', () => {
                modalTitle.textContent = problem.title;

                // Remove first line if it starts with #
                let bodyLines = problem.body_md.split('\n');
                if (bodyLines[0].startsWith('#')) bodyLines.shift();
                modalBody.innerHTML = marked.parse(bodyLines.join('\n'));

                modalInput.textContent = problem.input_format || 'No input format provided';
                modalOutput.textContent = problem.output_format || 'No output format provided';
                modal.style.display = 'block';
            });


            tableBody.appendChild(row);
        });
    }

    // Initial fetch and render
    let problemsData = await fetchProblems();
    renderTable(problemsData);

    // Search filter
    searchInput.addEventListener('input', () => {
        const filtered = filterProblems(problemsData, searchInput.value, selectedDifficulty);
        renderTable(filtered);
    });

    // Difficulty filter
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            selectedDifficulty = btn.getAttribute('data-difficulty');
            if (selectedDifficulty.toLowerCase() === 'beginner') selectedDifficulty = 'Easy';
            if (selectedDifficulty.toLowerCase() === 'intermediate') selectedDifficulty = 'Medium';
            if (selectedDifficulty.toLowerCase() === 'advanced') selectedDifficulty = 'Hard';

            const filtered = filterProblems(problemsData, searchInput.value, selectedDifficulty);
            renderTable(filtered);
        });
    });
});
