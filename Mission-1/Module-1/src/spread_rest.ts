// spread operator

const friends = ["a", "b"];

const schoolFriends = ['x','y','z'];

const collegeFriends = ["m","n","r"];

// friends.push(schoolFriends);
friends.push(...schoolFriends);

console.log(friends);

const user = { name: "Mezba", phoneNo: "0170000000" };

const otherInfo = { hobby: "outing", favouriteColor: "Black" };

const userInfo = { ...user, ...otherInfo };

console.log(userInfo);


// rest operator

const sendInvite = (...friends: string[]) => {
  friends.forEach((friend: string) =>
    console.log(`Send invitation to ${friend}`)
  );
};

sendInvite("pintu", "cinthu", "bulbul", "chulbul", "mezba");