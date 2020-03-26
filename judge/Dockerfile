## 1. Build
# docker build -t beetle-judge .
#
## 2. Start
# docker run --cap-add=NET_ADMIN -it --name beetle-judge -p 127.0.0.1:48753:48753 beetle-judge:latest
#
## 3. Connect with shell
# docker exec --user root -it beetle-judge /bin/bash
#
## 4. Disable network access for judge-instance
# iptables -A OUTPUT -m owner --uid-owner judge-instance -j DROP
#

FROM debian:latest

EXPOSE 48753/tcp

RUN apt-get update
RUN apt-get install -y gcc g++ iptables

RUN groupadd judge-master
RUN groupadd judge-instance
RUN useradd judge-instance -g judge-instance
RUN useradd judge-master -g judge-master -G judge-instance

RUN mkdir -p /home/judge-master/

COPY target/release/beetle-judge /home/judge-master/
COPY executor /home/judge-master/
COPY lang.yaml /home/judge-master/

RUN chown judge-master:judge-master /home/judge-master/beetle-judge
RUN chown root:judge-master /home/judge-master/executor
RUN chown judge-master:judge-master /home/judge-master/lang.yaml

# RUN chmod 770 /home/judge-master/
RUN chmod 770 /home/judge-master/beetle-judge
RUN chmod 4750 /home/judge-master/executor
RUN chmod 660 /home/judge-master/lang.yaml

RUN bash -c 'sed -i "s/JUDGE-INSTANCE-USER-ID/$(id -u judge-instance)/" /home/judge-master/lang.yaml'

USER judge-master
WORKDIR /home/judge-master
# CMD /home/judge-master/beetle-judge
CMD /home/judge-master/beetle-judge
