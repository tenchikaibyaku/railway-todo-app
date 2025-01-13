import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { url } from '../const';
import { useNavigate, useParams } from 'react-router-dom';
import './editTask.scss';

export const EditTask = () => {
  const navigate = useNavigate();
  const { listId, taskId } = useParams();
  const [cookies] = useCookies();
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [limit, setLimit] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleIsDoneChange = (e) => setIsDone(e.target.value === 'done');
  const handleLimitChange = (e) => setLimit(e.target.value);

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

  const onUpdateTask = () => {
    const data = {
      title,
      detail,
      done: isDone,
      limit: limit ? new Date(limit).toISOString() : null, // UTCで保存
    };

    axios
      .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate('/');
      })
      .catch((err) => {
        setErrorMessage(`更新に失敗しました。${err}`);
      });
  };

  const onDeleteTask = () => {
    axios
      .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate('/');
      })
      .catch((err) => {
        setErrorMessage(`削除に失敗しました。${err}`);
      });
  };

  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        const task = res.data;
        setTitle(task.title);
        setDetail(task.detail);
        setIsDone(task.done);
        // タイムゾーンを考慮して設定
        if (task.limit) {
          const localDate = new Date(task.limit);
          const offset = localDate.getTimezoneOffset() * 60000; // ミリ秒単位のオフセット
          const localTime = new Date(localDate.getTime() - offset)
            .toISOString()
            .slice(0, 16);
          setLimit(localTime);
        } else {
          setLimit('');
        }
      })
      .catch((err) => {
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`);
      });
  }, [listId, taskId, cookies.token]);

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <div className="form-group">
            <label htmlFor="title">タイトル</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="detail">詳細</label>
            <textarea
              id="detail"
              value={detail}
              onChange={handleDetailChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="limit">期限</label>
            <input
              id="limit"
              type="datetime-local"
              value={limit}
              onChange={handleLimitChange}
              className="form-control"
            />
          </div>

          <p>残り時間: {calculateRemainingTime(limit)}</p>

          <div className="form-group status-group">
            <input
              id="todo"
              type="radio"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={!isDone}
            />
            <label htmlFor="todo">未完了</label>
            <input
              id="done"
              type="radio"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone}
            />
            <label htmlFor="done">完了</label>
          </div>

          <div className="button-group">
            <button
              type="button"
              onClick={onUpdateTask}
              className="btn btn-primary"
            >
              更新
            </button>
            <button
              type="button"
              onClick={onDeleteTask}
              className="btn btn-danger"
            >
              削除
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
