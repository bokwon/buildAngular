// Scope.prototype.$$everyScope = function(fn) {
//     if (fn(this)) {
//         return this.$$children.every(function(child){
//             return child.$$everyScope(fn);
//         });
//     } else {
//         return false;
//     }
// }

function Scope() {
    this.watchers = [];
    this.children = [];
}
