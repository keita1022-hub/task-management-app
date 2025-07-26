document.addEventListener('DOMContentLoaded', () => {
    // HTML要素の取得
    const taskForm = document.getElementById('task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskSubjectInput = document.getElementById('task-subject');
    const taskDueDateInput = document.getElementById('task-due-date');
    const taskList = document.getElementById('task-list');
    const sortBtn = document.getElementById('sort-btn');

    // 編集モーダル関連の要素
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const closeModalBtn = document.querySelector('.close-btn');
    const editTaskId = document.getElementById('edit-task-id');
    const editTitle = document.getElementById('edit-title');
    const editSubject = document.getElementById('edit-subject');
    const editDueDate = document.getElementById('edit-due-date');

    // --- データ管理 ---
    // アプリケーションの全データをこの配列で管理する
    let tasks = [];

    // --- イベントリスナー ---

    // 1. 新規課題の追加フォーム
    taskForm.addEventListener('submit', e => {
        e.preventDefault();
        addTask(taskTitleInput.value, taskSubjectInput.value, taskDueDateInput.value);
        taskForm.reset();
    });

    // 2. 編集フォームの保存
    editForm.addEventListener('submit', e => {
        e.preventDefault();
        updateTask(editTaskId.value, editTitle.value, editSubject.value, editDueDate.value);
    });

    // 3. ソートボタン
    sortBtn.addEventListener('click', () => {
        sortTasks();
        renderTasks();
    });

    // 4. モーダルを閉じる
    closeModalBtn.addEventListener('click', () => editModal.style.display = 'none');
    window.addEventListener('click', e => {
        if (e.target == editModal) {
            editModal.style.display = 'none';
        }
    });

    // --- 関数定義 ---

    // 【メイン】課題リストを画面に描画する関数
    function renderTasks() {
        taskList.innerHTML = ''; // 既存のリストをクリア

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.isCompleted ? 'completed' : ''}`;
            li.dataset.id = task.id;

            // HTML構造を生成
            li.innerHTML = `
                <div class="task-main">
                    <div class="task-details">
                        <span class="title">${task.title}</span>
                        <span class="subject">科目: ${task.subject}</span>
                        <span class="due-date">提出期限: ${task.dueDate}</span>
                    </div>
                    <div class="task-actions">
                        <button class="complete-btn">完了</button>
                        <button class="edit-btn">編集</button>
                        <button class="delete-btn">削除</button>
                    </div>
                </div>
                <div class="subtask-container">
                    <h5>サブタスク</h5>
                    <ul class="subtask-list">
                        ${task.subtasks.map(sub => `
                            <li class="subtask-item ${sub.isCompleted ? 'completed' : ''}" data-id="${sub.id}">
                                <input type="checkbox" ${sub.isCompleted ? 'checked' : ''}>
                                <label>${sub.text}</label>
                            </li>
                        `).join('')}
                    </ul>
                    <form class="subtask-form">
                        <input type="text" placeholder="サブタスクを追加..." required>
                        <button type="submit">追加</button>
                    </form>
                </div>
            `;

            taskList.appendChild(li);
        });

        // 動的に生成された要素にイベントリスナーを再度割り当てる
        addEventListenersToTasks();
    }

    // 動的に生成された各ボタンにイベントを設定する関数
    function addEventListenersToTasks() {
        document.querySelectorAll('.task-item').forEach(item => {
            const taskId = item.dataset.id;

            // 完了ボタン
            item.querySelector('.complete-btn').addEventListener('click', () => toggleComplete(taskId));
            // 編集ボタン
            item.querySelector('.edit-btn').addEventListener('click', () => openEditModal(taskId));
            // 削除ボタン
            item.querySelector('.delete-btn').addEventListener('click', () => deleteTask(taskId));
            
            // サブタスク追加フォーム
            item.querySelector('.subtask-form').addEventListener('submit', e => {
                e.preventDefault();
                const input = e.target.querySelector('input');
                addSubtask(taskId, input.value);
                input.value = '';
            });

            // サブタスクのチェックボックス
            item.querySelectorAll('.subtask-item input[type="checkbox"]').forEach(checkbox => {
                const subtaskId = checkbox.parentElement.dataset.id;
                checkbox.addEventListener('change', () => toggleSubtaskComplete(taskId, subtaskId));
            });
        });
    }

    // --- データ操作関数 ---

    // 新規課題を追加
    function addTask(title, subject, dueDate) {
        const newTask = {
            id: Date.now().toString(),
            title,
            subject,
            dueDate,
            isCompleted: false,
            subtasks: []
        };
        tasks.push(newTask);
        sortTasks(); // 追加後にソート
        renderTasks();
    }

    // 課題を更新（編集）
    function updateTask(id, title, subject, dueDate) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.title = title;
            task.subject = subject;
            task.dueDate = dueDate;
        }
        editModal.style.display = 'none'; // モーダルを閉じる
        sortTasks();
        renderTasks();
    }

    // 課題を削除
    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
    }

    // 課題の完了状態を切り替え
    function toggleComplete(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.isCompleted = !task.isCompleted;
        }
        renderTasks();
    }

    // サブタスクを追加
    function addSubtask(taskId, text) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const newSubtask = {
                id: Date.now().toString(),
                text,
                isCompleted: false
            };
            task.subtasks.push(newSubtask);
        }
        renderTasks();
    }

    // サブタスクの完了状態を切り替え
    function toggleSubtaskComplete(taskId, subtaskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const subtask = task.subtasks.find(s => s.id === subtaskId);
            if (subtask) {
                subtask.isCompleted = !subtask.isCompleted;
            }
        }
        renderTasks();
    }

    // 課題をソート
    function sortTasks() {
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    // 編集モーダルを開く
    function openEditModal(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            editTaskId.value = task.id;
            editTitle.value = task.title;
            editSubject.value = task.subject;
            editDueDate.value = task.dueDate;
            editModal.style.display = 'block';
        }
    }

    // 初期描画
    renderTasks();
});