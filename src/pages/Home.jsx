import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Header } from '../components/Header';
import { url } from '../const';
import './home.scss';

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState('todo'); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [cookies] = useCookies();

  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);

  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);

  useEffect(() => {
    if (lists.length > 0) {
      const listId = lists[0]?.id;
      setSelectListId(listId);
      fetchTasks(listId);
    }
  }, [lists]);

  const fetchTasks = (listId) => {
    axios
      .get(`${url}/lists/${listId}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };

  const handleSelectList = (id) => {
    setSelectListId(id);
    fetchTasks(id);
  };

  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          <ul className="list-tab" role="tablist">
            {lists.map((list, key) => {
              const isActive = list.id === selectListId;
              return (
                <li
                  key={key}
                  className={`list-tab-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectList(list.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSelectList(list.id);
                    }
                  }}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0} // フォーカス可能にする
                >
                  {list.title}
                </li>
              );
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <label htmlFor="display-select">表示切替:</label>
              <select
                id="display-select"
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay } = props;

  // 期限日時を "YYYY-MM-DD HH:mm" 形式にフォーマットする関数
  const formatDeadline = (deadline) => {
    if (!deadline) return '未設定';
    const date = new Date(deadline);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0始まりなので +1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 残り時間を計算する関数
  const calculateRemainingTime = (deadline) => {
    if (!deadline) return '期限未設定';
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;

    if (diff <= 0) return '期限切れ';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}日 ${hours}時間 ${minutes}分`;
  };

  if (tasks === null) return <></>;

  // 完了・未完了のタスクを切り替え表示
  const filteredTasks = tasks.filter(
    (task) => task.done === (isDoneDisplay === 'done')
  );

  return (
    <ul className="task-list">
      {filteredTasks.map((task, key) => (
        <li key={key} className="task-item">
          <Link
            to={`/lists/${selectListId}/tasks/${task.id}`}
            className="task-item-link"
          >
            <div>
              <strong>タイトル:</strong> {task.title}
            </div>
            <div>
              <strong>期限:</strong> {formatDeadline(task.limit)}
            </div>
            <div>
              <strong>残り時間:</strong> {calculateRemainingTime(task.limit)}
            </div>
            <div>{task.done ? '完了' : '未完了'}</div>
          </Link>
        </li>
      ))}
    </ul>
  );
};


