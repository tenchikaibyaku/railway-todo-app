const calculateRemainingTime = (deadline) => {
  if (!deadline) return '期限未設定';

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate - now;

  if (diff <= 0) return '期限切れ';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  // 分の計算を修正: 1分未満でも1分と表示する
  const minutes = Math.max(1, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));

  return `${days}日 ${hours}時間 ${minutes}分`;
};
