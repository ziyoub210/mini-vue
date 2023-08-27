// /abc/.test('');

// 使用有限状态机 实现正则表达式

function test(string) {
  let i;
  let startIndex;
  let endIndex;
  function waitForA(char) {
    if (char === 'a') {
      startIndex = i;
      return waitForB;
    }
    return waitForA;
  }
  function waitForB(char) {
    if (char === 'b') {
      return waitForC;
    }
    return waitForA;
  }
  function waitForC(char) {
    console.log(char, ' char');
    if (char === 'c') {
      endIndex = i;
      return end;
    }
    return waitForA;
  }

  function end() {
    return end;
  }
  let currentState = waitForA;

  for (i = 0; i < string.length; i++) {
    let nextState = currentState(string[i]);
    currentState = nextState;
    if (currentState === end) {
      console.log(startIndex, endIndex);
      currentState = waitForA;
    }
  }
}

test('fabcfbfcde');
