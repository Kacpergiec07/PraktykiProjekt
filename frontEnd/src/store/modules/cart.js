export default {
    namespaced: true,
    state: () => ({
      items: [],
    }),
  
    getters: {
      totalItems(state) {
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },
      totalPrice(state) {
        return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    },
  
    mutations: {
      ADD_TO_CART(state, drug) {
        const existing = state.items.find(i => i.id === drug.idDrug);
        if (existing) {
          existing.quantity += 1;
        } else {
          state.items.push({
            id: drug.idDrug,
            name: drug.name,
            price: drug.price,
            quantity: 1,
          });
        }
      },
  
      REMOVE_FROM_CART(state, id) {
        state.items = state.items.filter(item => item.id !== id);
      },
  
      DECREASE_QUANTITY(state, id) {
        const item = state.items.find(item => item.id === id);
        if (item && item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items = state.items.filter(item => item.id !== id);
        }
      },
  
      CLEAR_CART(state) {
        state.items = [];
      },
    },
  
    actions: {
      async checkoutCart({ state, commit }, { userId }) {
        const order = {
          userId,
          items: state.items.map(({ id, quantity, price }) => ({ drugId: id, quantity, price })),
          status: 'PENDING',
        };
  
        try {
          await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order),
          });
          commit('CLEAR_CART');
        } catch (err) {
          console.error('Checkout failed', err);
        }
      },
    },
  };