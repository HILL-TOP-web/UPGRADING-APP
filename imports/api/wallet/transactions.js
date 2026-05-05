import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import { Users } from '../users/collection';
import { WalletTransactions } from './collection';

Meteor.methods({
  'wallet.transfer'(receiverId, amount) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized');
    }

    check(receiverId, String);
    check(amount, Number);

    if (amount <= 0) {
      throw new Meteor.Error('Invalid amount');
    }

    const sender = Users.findOne(this.userId);
    const receiver = Users.findOne(receiverId);

    if (!receiver) {
      throw new Meteor.Error('Receiver not found');
    }

    if (sender.balanceSKD < amount) {
      throw new Meteor.Error('Insufficient balance');
    }

    Users.update(sender._id, {
      $inc: {
        balanceSKD: -amount,
      },
    });

    Users.update(receiver._id, {
      $inc: {
        balanceSKD: amount,
      },
    });

    const transactionId = Random.id();

    WalletTransactions.insert({
      transactionId,
      senderId: sender._id,
      receiverId: receiver._id,
      amount,
      currency: 'SKD',
      status: 'completed',
      createdAt: new Date(),
    });

    return {
      success: true,
      transactionId,
    };
  },

  'wallet.swapToUSD'(amount) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized');
    }

    const SKD_PRICE = 2000;

    const user = Users.findOne(this.userId);

    if (!user) {
      throw new Meteor.Error('User not found');
    }

    if (user.balanceSKD < amount) {
      throw new Meteor.Error('Insufficient SKD');
    }

    const usdValue = amount * SKD_PRICE;

    Users.update(this.userId, {
      $inc: {
        balanceSKD: -amount,
        balanceUSD: usdValue,
      },
    });

    WalletTransactions.insert({
      userId: this.userId,
      type: 'swap',
      from: 'SKD',
      to: 'USD',
      amount,
      received: usdValue,
      createdAt: new Date(),
    });

    return {
      success: true,
      usdValue,
    };
  },
});
