/**
 * @file CallbackManager.ts
 * @description Shared callback management utility for socket event handlers.
 * Used by all socket feature modules (pharmacy, notification, chat).
 */

export class CallbackManager<T extends (...args: any[]) => void> {
   private callbacks: T[] = [];

   add(cb: T): void {
      if (!this.callbacks.includes(cb)) {
         this.callbacks.push(cb);
      }
   }

   remove(cb: T): boolean {
      const i = this.callbacks.indexOf(cb);
      if (i !== -1) {
         this.callbacks.splice(i, 1);
         return true;
      }
      return false;
   }

   execute(...args: Parameters<T>): void {
      this.callbacks.forEach((cb) => {
         try {
            cb(...args);
         } catch (error) {
            console.error('[Socket] Callback error:', error);
         }
      });
   }

   clear(): void {
      this.callbacks.length = 0;
   }

   get size(): number {
      return this.callbacks.length;
   }
}
