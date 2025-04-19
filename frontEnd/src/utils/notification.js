/**
 * Simple notification utility
 */
class NotificationService {
  constructor() {
    // Set up a container for notifications if it doesn't exist
    if (!document.getElementById("notification-container")) {
      this.container = document.createElement("div");
      this.container.id = "notification-container";
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById("notification-container");
    }
  }

  /**
   * Show a success notification
   * @param {string} message - Notification message
   * @param {number} duration - Duration in ms (default: 3000)
   */
  success(message, duration = 3000) {
    this.showNotification(message, "success", duration);
  }

  /**
   * Show an error notification
   * @param {string} message - Notification message
   * @param {number} duration - Duration in ms (default: 5000)
   */
  error(message, duration = 5000) {
    this.showNotification(message, "error", duration);
  }

  /**
   * Show an info notification
   * @param {string} message - Notification message
   * @param {number} duration - Duration in ms (default: 3000)
   */
  info(message, duration = 3000) {
    this.showNotification(message, "info", duration);
  }

  /**
   * Show a warning notification
   * @param {string} message - Notification message
   * @param {number} duration - Duration in ms (default: 4000)
   */
  warning(message, duration = 4000) {
    this.showNotification(message, "warning", duration);
  }

  /**
   * Create and show a notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, info, warning)
   * @param {number} duration - Duration in ms
   * @private
   */
  showNotification(message, type, duration) {
    // Create notification element
    const notification = document.createElement("div");

    // Set styles based on type
    const baseStyles = `
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
      max-width: 350px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    let typeStyles = "";
    let icon = "";

    switch (type) {
      case "success":
        typeStyles =
          "background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;";
        icon = "✓";
        break;
      case "error":
        typeStyles =
          "background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;";
        icon = "✕";
        break;
      case "info":
        typeStyles =
          "background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;";
        icon = "ℹ";
        break;
      case "warning":
        typeStyles =
          "background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba;";
        icon = "⚠";
        break;
      default:
        typeStyles =
          "background-color: #f8f9fa; color: #343a40; border: 1px solid #ddd;";
    }

    notification.style.cssText = baseStyles + typeStyles;

    // Set content
    notification.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span style="font-weight: bold; margin-right: 8px;">${icon}</span>
        <span>${message}</span>
      </div>
      <button style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 0 0 0 10px;">×</button>
    `;

    // Add close button functionality
    const closeButton = notification.querySelector("button");
    closeButton.addEventListener("click", () => {
      this.closeNotification(notification);
    });

    // Add to container
    this.container.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
      notification.style.opacity = "1";
    }, 10);

    // Auto-close after duration
    setTimeout(() => {
      this.closeNotification(notification);
    }, duration);

    return notification;
  }

  /**
   * Close a notification
   * @param {HTMLElement} notification - Notification element
   * @private
   */
  closeNotification(notification) {
    notification.style.opacity = "0";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
}

// Export as singleton
export default new NotificationService();
