// src/services/OrganizationMembersService.js
import axios from 'axios';

const API_URL = 'http://localhost/api/organization-members';

export default {
  /**
   * 組織メンバー一覧を取得する
   * @param {number} tenantId テナントID
   * @param {string} type メンバータイプ（'manager' または 'employee'）
   * @param {number} page ページ番号
   * @param {number} itemsPerPage 1ページあたりの表示件数
   * @returns {Promise<Object>} メンバー一覧データ
   */
  async getMembers(tenantId = 1, type = 'employee', page = 1, itemsPerPage = 10) {
    try {
      const response = await axios.post(`${API_URL}/get`, {
        tenant_id: tenantId,
        type: type,
        page: page,
        items_per_page: itemsPerPage
      });
      return response.data;
    } catch (error) {
      console.error('メンバー取得エラー:', error);
      throw error;
    }
  },

  /**
   * 組織メンバーを保存する
   * @param {number} tenantId テナントID
   * @param {Array} members メンバーデータの配列
   * @returns {Promise<Object>} 保存結果
   */
  async saveMembers(tenantId = 1, members) {
    try {
      const response = await axios.post(`${API_URL}/save`, {
        tenant_id: tenantId,
        members: members
      });
      return response.data;
    } catch (error) {
      console.error('メンバー保存エラー:', error);
      throw error;
    }
  },

  /**
   * CSVファイルからメンバーをインポートする
   * @param {number} tenantId テナントID
   * @param {File} csvFile CSVファイル
   * @param {string} type メンバータイプ（'manager' または 'employee'）
   * @returns {Promise<Object>} インポート結果
   */
  async importMembersFromCsv(tenantId = 1, csvFile, type = 'employee') {
    try {
      const formData = new FormData();
      formData.append('tenant_id', tenantId);
      formData.append('type', type);
      formData.append('csv_file', csvFile);

      const response = await axios.post(`${API_URL}/import-csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('CSVインポートエラー:', error);
      throw error;
    }
  },

  /**
   * メンバーを削除する
   * @param {number} tenantId テナントID
   * @param {number} memberId メンバーID
   * @returns {Promise<Object>} 削除結果
   */
  async deleteMember(tenantId = 1, memberId) {
    try {
      const response = await axios.post(`${API_URL}/delete`, {
        tenant_id: tenantId,
        member_id: memberId
      });
      return response.data;
    } catch (error) {
      console.error('メンバー削除エラー:', error);
      throw error;
    }
  },

  /**
   * 組織ドロップダウン用のデータを取得する
   * @param {number} tenantId テナントID
   * @returns {Promise<Object>} 組織データ
   */
  async getOrganizationOptions(tenantId = 1) {
    try {
      const response = await axios.post(`${API_URL}/organization-options`, {
        tenant_id: tenantId
      });
      return response.data;
    } catch (error) {
      console.error('組織データ取得エラー:', error);
      throw error;
    }
  }
};
