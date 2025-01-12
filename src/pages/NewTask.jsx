import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { url } from "../const";
import { Header } from "../components/Header";
import { useNavigate } from "react-router-dom";
import "./newTask.scss";

export const NewTask = () => {
  const [selectListId, setSelectListId] = useState();
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [limit, setLimit] = useState(""); // 期限を追加
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const navigate = useNavigate();

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleLimitChange = (e) => setLimit(e.target.value);
  const handleSelectList = (id) => setSelectListId(id);

  const onCreateTask = () => {
    const data = {
      title: title,
      detail: detail,
      done: false,
      limit: new Date(limit).toISOString(), // ISOフォーマットに変換
    };

    axios
      .post(`${url}/lists/${selectListId}/tasks`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        setErrorMessage(`タスクの作成に失敗しました。${err}`);
      });
  };

  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
        setSelectListId(res.data[0]?.id);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);

  return (
    <div>
      <Header />
      <main className="new-task">
        <h2>タスク新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="new-task-form">
          <div className="form-group">
            <label htmlFor="new-task-list">リスト</label>
            <select
              id="new-task-list"
              name="list"
              onChange={(e) => handleSelectList(e.target.value)}
              className="new-task-select-list"
            >
              {lists.map((list, key) => (
                <option key={key} className="list-item" value={list.id}>
                  {list.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="new-task-title">タイトル</label>
            <input
              id="new-task-title"
              name="title"
              type="text"
              onChange={handleTitleChange}
              className="new-task-title"
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-task-detail">詳細</label>
            <textarea
              id="new-task-detail"
              name="detail"
              onChange={handleDetailChange}
              className="new-task-detail"
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-task-limit">期限</label>
            <input
              id="new-task-limit"
              name="limit"
              type="datetime-local"
              onChange={handleLimitChange}
              value={limit}
              className="new-task-limit"
            />
          </div>
          <button
            type="button"
            className="new-task-button"
            onClick={onCreateTask}
          >
            作成
          </button>
        </form>
      </main>
    </div>
  );
};
