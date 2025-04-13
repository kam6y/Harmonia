// front/src/components/common/notificationService.js
import axios from 'axios';

// 通知関連（施策コメント）のAPI通信を行うサービス
const NotificationService = {
  /**
   * 通知一覧（施策コメント）を取得する
   * @param {number} tenantId - テナントID
   * @returns {Promise} - 通知一覧
   */
  getNotifications: async (tenantId = 1) => {
    try {
      const response = await axios.post('http://localhost/api/notifications/get', {
        tenant_id: tenantId
      });
      
      if (response.data.success) {
        return response.data.notifications;
      }
      
      throw new Error(response.data.message || '通知の取得に失敗しました');
    } catch (error) {
      console.error('通知取得エラー:', error);
      throw error;
    }
  },
  
  /**
   * 特定の通知を既読状態として記録する（クライアント側での処理）
   * @param {number} notificationId - 通知ID
   * @returns {Promise} - 結果
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await axios.post('http://localhost/api/notifications/mark-read', {
        notification_id: notificationId
      });
      
      return response.data.success;
    } catch (error) {
      console.error('通知既読更新エラー:', error);
      throw error;
    }
  },
  
  /**
   * すべての通知を既読状態として記録する（クライアント側での処理）
   * @returns {Promise} - 結果
   */
  markAllAsRead: async () => {
    try {
      // エンドポイントを mark-all-read に変更
      const response = await axios.post('http://localhost/api/notifications/mark-all-read', {});
      
      return response.data.success;
    } catch (error) {
      console.error('全通知既読更新エラー:', error);
      throw error;
    }
  },
  
  /**
   * 新しい通知（施策コメント）を作成する
   * @param {Object} commentData - コメントデータ
   * @returns {Promise} - 作成された通知
   */
  createNotification: async (commentData) => {
    try {
      const response = await axios.post('http://localhost/api/notifications/create', {
        measure_id: commentData.measureId,
        comment_text: commentData.comment
        // 必要に応じて他のフィールドも追加する
      });
      
      if (response.data.success) {
        return {
          id: response.data.notification_id,
          ...commentData
        };
      }
      
      throw new Error(response.data.message || 'コメントの作成に失敗しました');
    } catch (error) {
      console.error('コメント作成エラー:', error);
      throw error;
    }
  },
  
  /**
   * 通知（施策コメント）を削除する
   * @param {number} notificationId - 通知ID
   * @returns {Promise} - 結果
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await axios.post('http://localhost/api/notifications/delete', {
        notification_id: notificationId
      });
      
      return response.data.success;
    } catch (error) {
      console.error('コメント削除エラー:', error);
      throw error;
    }
  }
};

export default NotificationService;